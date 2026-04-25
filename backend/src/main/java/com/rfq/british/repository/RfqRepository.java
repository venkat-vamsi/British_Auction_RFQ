package com.rfq.british.repository;

import com.rfq.british.enums.AuctionStatus;
import com.rfq.british.model.Rfq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RfqRepository extends JpaRepository<Rfq, Long> {

    List<Rfq> findAllByOrderByCreatedAtDesc();

    List<Rfq> findByStatusAndForcedCloseTimeBefore(AuctionStatus status, LocalDateTime time);

    List<Rfq> findByStatusAndBidCloseTimeBefore(AuctionStatus status, LocalDateTime time);

    @Query("SELECT r FROM Rfq r WHERE r.status = :status AND r.bidStartTime <= :now AND r.bidCloseTime > :now")
    List<Rfq> findDueToActivate(AuctionStatus status, LocalDateTime now);

    boolean existsByReferenceId(String referenceId);
}
