package com.fraudshield.repository;

import com.fraudshield.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByTransactionId(String transactionId);

    Page<Transaction> findByTransactionStatus(String status, Pageable pageable);

    @Query("""
        SELECT t FROM Transaction t
        WHERE (:status IS NULL OR t.transactionStatus = :status)
        AND (:search IS NULL OR LOWER(t.transactionId) LIKE LOWER(CONCAT('%',:search,'%'))
             OR LOWER(t.merchantName) LIKE LOWER(CONCAT('%',:search,'%'))
             OR LOWER(t.userEmail) LIKE LOWER(CONCAT('%',:search,'%'))
             OR LOWER(t.userId) LIKE LOWER(CONCAT('%',:search,'%')))
        """)
    Page<Transaction> findWithFilters(
        @Param("status") String status,
        @Param("search") String search,
        Pageable pageable
    );

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.createdAt >= :since")
    long countSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.transactionStatus = 'MANUAL_REVIEW'")
    long countPendingReviews();

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.fraudScore >= 70 AND t.createdAt >= :since")
    long countHighRiskSince(@Param("since") LocalDateTime since);

    @Query("SELECT AVG(t.processingTimeMs) FROM Transaction t WHERE t.createdAt >= :since")
    Double avgProcessingTimeSince(@Param("since") LocalDateTime since);

    long countByTransactionStatus(String status);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.fraudScore >= 70")
    long countHighRisk();
}
