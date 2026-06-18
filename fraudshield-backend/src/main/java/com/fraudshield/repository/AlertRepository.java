package com.fraudshield.repository;
import com.fraudshield.entity.SystemAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<SystemAlert, Long> {
    List<SystemAlert> findAllByOrderByCreatedAtDesc();
    @Query("SELECT COUNT(a) FROM SystemAlert a WHERE a.status = 'ACTIVE'")
    long countActive();
    long countByStatus(String status);
}
