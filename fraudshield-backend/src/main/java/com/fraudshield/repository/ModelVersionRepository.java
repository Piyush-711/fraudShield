package com.fraudshield.repository;

import com.fraudshield.entity.ModelVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ModelVersionRepository extends JpaRepository<ModelVersion, Long> {
    Optional<ModelVersion> findByIsActiveTrue();
    Optional<ModelVersion> findByModelVersion(String modelVersion);
    boolean existsByModelVersion(String modelVersion);
}
