package com.worksphere.shared.logging;

import com.worksphere.shared.response.ApiResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("RequestCorrelationFilter & Structured Logging Tests")
class RequestCorrelationFilterTest {

    private RequestCorrelationFilter filter;

    @BeforeEach
    void setUp() {
        filter = new RequestCorrelationFilter();
        MDC.clear();
    }

    @AfterEach
    void tearDown() {
        MDC.clear();
    }

    @Test
    @DisplayName("Should generate UUID and populate header and MDC when X-Request-ID is absent")
    void testAbsentRequestIdGeneratesUuid() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/projects");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean mdcVerifiedInsideChain = new AtomicBoolean(false);

        MockFilterChain chain = new MockFilterChain() {
            @Override
            public void doFilter(jakarta.servlet.ServletRequest req, jakarta.servlet.ServletResponse res) {
                String currentMdc = MDC.get(RequestCorrelationFilter.MDC_REQUEST_ID_KEY);
                if (currentMdc != null && currentMdc.length() >= 32) {
                    mdcVerifiedInsideChain.set(true);
                }
            }
        };

        filter.doFilter(request, response, chain);

        String responseHeader = response.getHeader(RequestCorrelationFilter.REQUEST_ID_HEADER);
        assertThat(responseHeader).isNotNull();
        assertThat(responseHeader).hasSizeGreaterThanOrEqualTo(32);
        assertThat(mdcVerifiedInsideChain).isTrue();
        assertThat(MDC.get(RequestCorrelationFilter.MDC_REQUEST_ID_KEY)).isNull();
    }

    @Test
    @DisplayName("Should preserve valid incoming X-Request-ID")
    void testValidIncomingRequestIdPreserved() throws Exception {
        String validId = "req-custom-client-12345";
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        request.addHeader(RequestCorrelationFilter.REQUEST_ID_HEADER, validId);
        MockHttpServletResponse response = new MockHttpServletResponse();

        AtomicBoolean mdcMatches = new AtomicBoolean(false);
        MockFilterChain chain = new MockFilterChain() {
            @Override
            public void doFilter(jakarta.servlet.ServletRequest req, jakarta.servlet.ServletResponse res) {
                if (validId.equals(MDC.get(RequestCorrelationFilter.MDC_REQUEST_ID_KEY))) {
                    mdcMatches.set(true);
                }
            }
        };

        filter.doFilter(request, response, chain);

        assertThat(response.getHeader(RequestCorrelationFilter.REQUEST_ID_HEADER)).isEqualTo(validId);
        assertThat(mdcMatches).isTrue();
        assertThat(MDC.get(RequestCorrelationFilter.MDC_REQUEST_ID_KEY)).isNull();
    }

    @Test
    @DisplayName("Should replace invalid or log-injecting X-Request-ID with safe UUID")
    void testInvalidHeaderReplaced() throws Exception {
        String maliciousId = "req-123\r\nINJECTED_LOG: attack";
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/tasks");
        request.addHeader(RequestCorrelationFilter.REQUEST_ID_HEADER, maliciousId);
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        String effectiveId = response.getHeader(RequestCorrelationFilter.REQUEST_ID_HEADER);
        assertThat(effectiveId).isNotNull();
        assertThat(effectiveId).isNotEqualTo(maliciousId);
        assertThat(effectiveId).doesNotContain("\r", "\n", "INJECTED");
    }

    @Test
    @DisplayName("Should clear MDC even when exception is thrown in filter chain")
    void testMdcClearedOnException() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/crash");
        MockHttpServletResponse response = new MockHttpServletResponse();

        MockFilterChain chain = new MockFilterChain() {
            @Override
            public void doFilter(jakarta.servlet.ServletRequest req, jakarta.servlet.ServletResponse res) {
                throw new RuntimeException("Simulated catastrophic crash");
            }
        };

        try {
            filter.doFilter(request, response, chain);
        } catch (Exception ignored) {
            // Expected
        }

        assertThat(MDC.get(RequestCorrelationFilter.MDC_REQUEST_ID_KEY)).isNull();
    }

    @Test
    @DisplayName("Should isolate MDC request IDs across concurrent threads")
    void testConcurrentMdcIsolation() throws InterruptedException {
        int threadCount = 10;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(threadCount);
        AtomicBoolean isolationIntact = new AtomicBoolean(true);

        for (int i = 0; i < threadCount; i++) {
            final String threadReqId = "thread-id-" + i;
            executor.submit(() -> {
                try {
                    MockHttpServletRequest req = new MockHttpServletRequest("GET", "/api/v1/test");
                    req.addHeader(RequestCorrelationFilter.REQUEST_ID_HEADER, threadReqId);
                    MockHttpServletResponse res = new MockHttpServletResponse();

                    filter.doFilter(req, res, new MockFilterChain() {
                        @Override
                        public void doFilter(jakarta.servlet.ServletRequest r, jakarta.servlet.ServletResponse s) {
                            String current = MDC.get(RequestCorrelationFilter.MDC_REQUEST_ID_KEY);
                            if (!threadReqId.equals(current)) {
                                isolationIntact.set(false);
                            }
                        }
                    });
                } catch (Exception e) {
                    isolationIntact.set(false);
                } finally {
                    latch.countDown();
                }
            });
        }

        boolean completed = latch.await(5, TimeUnit.SECONDS);
        executor.shutdown();

        assertThat(completed).isTrue();
        assertThat(isolationIntact).isTrue();
    }

    @Test
    @DisplayName("Should populate ApiResponse.traceId from active MDC during request")
    void testApiResponsePullsActiveTraceId() throws Exception {
        String testId = "trace-test-abc-987";
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/dashboard");
        request.addHeader(RequestCorrelationFilter.REQUEST_ID_HEADER, testId);
        MockHttpServletResponse response = new MockHttpServletResponse();

        AtomicBoolean verifiedResponseTraceId = new AtomicBoolean(false);

        MockFilterChain chain = new MockFilterChain() {
            @Override
            public void doFilter(jakarta.servlet.ServletRequest req, jakarta.servlet.ServletResponse res) {
                ApiResponse<String> apiRes = ApiResponse.success("ok_data");
                if (testId.equals(apiRes.traceId())) {
                    verifiedResponseTraceId.set(true);
                }
            }
        };

        filter.doFilter(request, response, chain);

        assertThat(verifiedResponseTraceId).isTrue();
    }
}
