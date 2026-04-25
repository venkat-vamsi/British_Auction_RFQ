package com.rfq.british.repository;

import com.rfq.british.model.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {

    List<Bid> findByRfqIdOrderByTotalChargesAsc(Long rfqId);

    @Query("SELECT b FROM Bid b WHERE b.rfq.id = :rfqId AND b.supplier.id = :supplierId ORDER BY b.totalCharges ASC")
    List<Bid> findByRfqAndSupplierOrderByTotal(Long rfqId, Long supplierId);

    @Query("SELECT b FROM Bid b WHERE b.rfq.id = :rfqId AND b.submittedAt >= :since ORDER BY b.submittedAt ASC")
    List<Bid> findByRfqSince(Long rfqId, LocalDateTime since);

    @Query("""
        SELECT b FROM Bid b
        WHERE b.rfq.id = :rfqId
          AND b.totalCharges = (
              SELECT MIN(b2.totalCharges) FROM Bid b2
              WHERE b2.rfq.id = :rfqId AND b2.supplier.id = b.supplier.id
          )
        ORDER BY b.totalCharges ASC
    """)
    List<Bid> findBestBidPerSupplier(Long rfqId);

    Optional<Bid> findTopByRfqIdAndSupplierIdOrderByTotalChargesAsc(Long rfqId, Long supplierId);
}
