package com.worksphere.asset.dev;

import com.worksphere.asset.domain.AssetCategory;
import com.worksphere.asset.infrastructure.persistence.AssetCategoryRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.DefaultApplicationArguments;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DevAssetFixtureProvisionerTest {

    @Mock
    private AssetCategoryRepository categoryRepository;

    @Test
    @DisplayName("1. When disabled, provisioner performs no repository operations")
    void shouldDoNothingWhenDisabled() {
        DevAssetFixtureProvisioner provisioner = new DevAssetFixtureProvisioner(categoryRepository, false);
        provisioner.run(new DefaultApplicationArguments());
        verifyNoInteractions(categoryRepository);
    }

    @Test
    @DisplayName("2. When enabled and category does not exist, provisions active category")
    void shouldProvisionActiveCategoryWhenAbsent() {
        when(categoryRepository.existsByCode(DevAssetFixtureProvisioner.FIXTURE_CATEGORY_CODE)).thenReturn(false);

        DevAssetFixtureProvisioner provisioner = new DevAssetFixtureProvisioner(categoryRepository, true);
        provisioner.run(new DefaultApplicationArguments());

        ArgumentCaptor<AssetCategory> captor = ArgumentCaptor.forClass(AssetCategory.class);
        verify(categoryRepository).save(captor.capture());

        AssetCategory saved = captor.getValue();
        assertThat(saved.getCode()).isEqualTo(DevAssetFixtureProvisioner.FIXTURE_CATEGORY_CODE);
        assertThat(saved.getName()).isEqualTo(DevAssetFixtureProvisioner.FIXTURE_CATEGORY_NAME);
        assertThat(saved.isActive()).isTrue();
        assertThat(saved.isDeleted()).isFalse();
    }

    @Test
    @DisplayName("3. When category already exists, provisioner is idempotent and skips creation")
    void shouldSkipWhenAlreadyExists() {
        when(categoryRepository.existsByCode(DevAssetFixtureProvisioner.FIXTURE_CATEGORY_CODE)).thenReturn(true);

        DevAssetFixtureProvisioner provisioner = new DevAssetFixtureProvisioner(categoryRepository, true);
        provisioner.run(new DefaultApplicationArguments());

        verify(categoryRepository, never()).save(any());
    }
}
