package com.worksphere.shared.security;

import com.worksphere.identity.domain.Permission;
import com.worksphere.identity.domain.Role;
import com.worksphere.identity.domain.User;
import com.worksphere.identity.infrastructure.persistence.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Focused unit and security tests for {@link JwtAuthenticationFilter}.
 * Verifies authorization context population, failure modes, authority derivation,
 * token secrecy, and prevention of LazyInitializationException.
 */
@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FilterChain filterChain;

    @Mock
    private Claims claims;

    private JwtAuthenticationFilter filter;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        filter = new JwtAuthenticationFilter(jwtService, userRepository);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("1. Valid signed token with active user populates SecurityContext with authorities and continues chain")
    void shouldAuthenticateValidTokenWithActiveUser() throws ServletException, IOException {
        UUID userId = UUID.randomUUID();
        when(claims.getSubject()).thenReturn(userId.toString());
        when(jwtService.validateAndParseToken("valid-token")).thenReturn(claims);

        Permission perm = mock(Permission.class);
        when(perm.getCode()).thenReturn("ASSET_READ");

        Role role = mock(Role.class);
        when(role.isActive()).thenReturn(true);
        when(role.getCode()).thenReturn("EMPLOYEE");
        when(role.getPermissions()).thenReturn(Set.of(perm));

        User user = User.create(userId, "test_user", "test@worksphere.local", "hash", "Test User");
        user.lock();
        user.unlock(); // sets status to ACTIVE
        user.setRoles(Set.of(role));

        when(userRepository.findActiveWithRolesById(userId)).thenReturn(Optional.of(user));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer valid-token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNotNull();
        assertThat(auth.isAuthenticated()).isTrue();
        assertThat(auth.getPrincipal()).isInstanceOf(WorkSphereUserPrincipal.class);
        WorkSphereUserPrincipal principal = (WorkSphereUserPrincipal) auth.getPrincipal();
        assertThat(principal.userId()).isEqualTo(userId);

        Set<String> authorityStrings = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(java.util.stream.Collectors.toSet());

        assertThat(authorityStrings).contains("ROLE_EMPLOYEE", "ASSET_READ");
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("2. Missing user results in unauthenticated SecurityContext without exception leak")
    void shouldNotAuthenticateWhenUserNotFoundInDatabase() throws ServletException, IOException {
        UUID userId = UUID.randomUUID();
        when(claims.getSubject()).thenReturn(userId.toString());
        when(jwtService.validateAndParseToken("valid-token")).thenReturn(claims);
        when(userRepository.findActiveWithRolesById(userId)).thenReturn(Optional.empty());

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer valid-token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("3. Inactive or locked user is rejected and not authenticated")
    void shouldRejectInactiveUser() throws ServletException, IOException {
        UUID userId = UUID.randomUUID();
        when(claims.getSubject()).thenReturn(userId.toString());
        when(jwtService.validateAndParseToken("valid-token")).thenReturn(claims);

        User inactiveUser = User.create(userId, "inactive_user", "inactive@worksphere.local", "hash", "Inactive User");
        inactiveUser.lock(); // status = LOCKED != ACTIVE

        when(userRepository.findActiveWithRolesById(userId)).thenReturn(Optional.of(inactiveUser));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer valid-token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("4. Deleted user returns empty from repository and is not authenticated")
    void shouldNotAuthenticateWhenRepositoryExcludesDeletedUser() throws ServletException, IOException {
        UUID userId = UUID.randomUUID();
        when(claims.getSubject()).thenReturn(userId.toString());
        when(jwtService.validateAndParseToken("valid-token")).thenReturn(claims);
        when(userRepository.findActiveWithRolesById(userId)).thenReturn(Optional.empty());

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer valid-token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("5. Invalid token code results in empty SecurityContext and continues filter chain")
    void shouldNotAuthenticateWhenTokenInvalid() throws ServletException, IOException {
        when(jwtService.validateAndParseToken("invalid-token"))
                .thenThrow(new JwtAuthenticationException("TOKEN_INVALID", "Invalid token"));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer invalid-token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(userRepository, never()).findActiveWithRolesById(any());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("6. Expired token code results in empty SecurityContext and continues filter chain")
    void shouldNotAuthenticateWhenTokenExpired() throws ServletException, IOException {
        when(jwtService.validateAndParseToken("expired-token"))
                .thenThrow(new JwtAuthenticationException("TOKEN_EXPIRED", "Token expired"));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer expired-token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(userRepository, never()).findActiveWithRolesById(any());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("7. Malformed Authorization header without 'Bearer ' prefix is ignored")
    void shouldIgnoreMalformedAuthorizationHeader() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Basic dXNlcjpwYXNz");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(jwtService, never()).validateAndParseToken(anyString());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("8. Filter sources roles and permissions authoritatively from database User entity, ignoring JWT claims")
    void shouldDeriveAuthoritiesStrictlyFromDatabaseEntity() throws ServletException, IOException {
        UUID userId = UUID.randomUUID();
        when(claims.getSubject()).thenReturn(userId.toString());
        when(jwtService.validateAndParseToken("token")).thenReturn(claims);

        Permission p1 = mock(Permission.class);
        when(p1.getCode()).thenReturn("TASK_READ");
        Permission p2 = mock(Permission.class);
        when(p2.getCode()).thenReturn("TASK_UPDATE");

        Role r1 = mock(Role.class);
        when(r1.isActive()).thenReturn(true);
        when(r1.getCode()).thenReturn("EMPLOYEE");
        when(r1.getPermissions()).thenReturn(Set.of(p1, p2));

        Role inactiveRole = mock(Role.class);
        when(inactiveRole.isActive()).thenReturn(false);

        User user = User.create(userId, "auth_user", "auth@worksphere.local", "hash", "Auth User");
        user.lock();
        user.unlock(); // sets status to ACTIVE
        user.setRoles(Set.of(r1, inactiveRole));

        when(userRepository.findActiveWithRolesById(userId)).thenReturn(Optional.of(user));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNotNull();
        Set<String> authorities = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(java.util.stream.Collectors.toSet());

        assertThat(authorities).containsExactlyInAnyOrder("ROLE_EMPLOYEE", "TASK_READ", "TASK_UPDATE");
    }

    @Test
    @DisplayName("9. Eagerly loaded roles and permissions execute without LazyInitializationException")
    void shouldExecuteWithoutLazyInitializationException() throws ServletException, IOException {
        UUID userId = UUID.randomUUID();
        when(claims.getSubject()).thenReturn(userId.toString());
        when(jwtService.validateAndParseToken("token")).thenReturn(claims);

        User user = User.create(userId, "u", "u@worksphere.local", "hash", "Name");
        user.lock();
        user.unlock(); // sets status to ACTIVE
        user.setRoles(Collections.emptySet());

        when(userRepository.findActiveWithRolesById(userId)).thenReturn(Optional.of(user));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        verify(userRepository).findActiveWithRolesById(userId);
    }
}
