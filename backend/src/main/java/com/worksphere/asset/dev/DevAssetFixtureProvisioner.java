package com.worksphere.asset.dev;

import com.worksphere.asset.domain.AssetCategory;
import com.worksphere.asset.infrastructure.persistence.AssetCategoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * Development-only provisioner for canonical E2E AssetCategory fixture.
 *
 * Invariants:
 * - Strictly guarded by @Profile("dev") and @ConditionalOnProperty("worksphere.dev.e2e-asset-fixture.enabled").
 * - Disabled by default.
 * - Idempotent execution (creates single canonical fixture if absent, skips if present).
 * - Never active in production.
 */
@Component
@Profile("dev")
@ConditionalOnProperty(name = "worksphere.dev.e2e-asset-fixture.enabled", havingValue = "true", matchIfMissing = false)
public class DevAssetFixtureProvisioner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DevAssetFixtureProvisioner.class);

    public static final String FIXTURE_CATEGORY_CODE = "E2E_ASSET_CAT";
    public static final String FIXTURE_CATEGORY_NAME = "Thiết bị văn phòng E2E";
    public static final String FIXTURE_CATEGORY_DESC = "Danh mục tài sản kiểm định E2E phát triển";

    private final AssetCategoryRepository categoryRepository;
    private final boolean enabled;

    public DevAssetFixtureProvisioner(
            AssetCategoryRepository categoryRepository,
            @Value("${worksphere.dev.e2e-asset-fixture.enabled:false}") boolean enabled
    ) {
        this.categoryRepository = categoryRepository;
        this.enabled = enabled;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!enabled) {
            log.info("E2E asset category fixture disabled.");
            return;
        }

        if (categoryRepository.existsByCode(FIXTURE_CATEGORY_CODE)) {
            log.info("E2E asset category fixture '{}' already exists. Skipping.", FIXTURE_CATEGORY_CODE);
            return;
        }

        AssetCategory fixtureCategory = AssetCategory.create(
                UUID.randomUUID(),
                FIXTURE_CATEGORY_CODE,
                FIXTURE_CATEGORY_NAME,
                FIXTURE_CATEGORY_DESC,
                true,
                Instant.now()
        );

        categoryRepository.save(fixtureCategory);
        log.info("E2E asset category fixture '{}' provisioned successfully with ACTIVE status.", FIXTURE_CATEGORY_CODE);
    }
}
