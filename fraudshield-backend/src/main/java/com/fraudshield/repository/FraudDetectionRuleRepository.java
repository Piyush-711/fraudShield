package com.fraudshield.repository;

import com.fraudshield.entity.FraudDetectionRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FraudDetectionRuleRepository extends JpaRepository<FraudDetectionRule, Long> {
    List<FraudDetectionRule> findByEnabledTrueOrderByPriorityDesc();
    boolean existsByName(String name);
}
