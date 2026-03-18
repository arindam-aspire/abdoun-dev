const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  // Limit coverage scope to refactored Phase 1–4 core modules.
  // This repo is mid-refactor and not yet test-complete across all pages/components.
  collectCoverageFrom: [
    "src/features/auth/authSlice.ts",
    "src/features/auth/hooks/useLogin.ts",
    "src/features/auth/hooks/useSession.ts",
    "src/lib/auth/sessionManager.ts",
    "src/permissions/model.ts",
    "src/features/profile/hooks/useUpdateProfile.ts",
    "src/features/profile/schemas/profileFormSchema.ts",
    "src/features/public-home/hooks/useExclusiveProperties.ts",
    "src/features/property-search/hooks/useSearchFilters.ts",
    "src/features/property-search/hooks/usePropertySearch.ts",
    "src/features/property-search/utils/queryStringBuilder.ts",
    // Phase 5 (Property Details) core refactor modules
    "src/features/property-details/hooks/usePropertyDetails.ts",
    "src/features/property-details/hooks/usePropertyDetailsTabs.ts",
    "src/features/property-details/utils/amenitiesMapper.ts",
    "src/features/property-details/utils/galleryMapper.ts",
    "src/features/property-details/utils/neighborhoodMapper.ts",
    "src/features/property-details/utils/propertyDetailsMapper.ts",
    "src/features/property-details/utils/statsMapper.ts",
    // Phase 6 (Favourites & Compare) core refactor modules
    "src/features/favourites/hooks/useFavourites.ts",
    "src/features/compare/hooks/useCompareSelection.ts",
    "src/features/compare/utils/compareIds.ts",
    // Phase 7 (Saved Searches) core refactor modules
    "src/features/saved-searches/hooks/useSavedSearches.ts",
    "src/features/saved-searches/types.ts",
  ],
  coverageThreshold: {
    global: {
      lines: 70,
      statements: 70,
      functions: 70,
      branches: 60,
    },
  },
};

module.exports = createJestConfig(customJestConfig);

