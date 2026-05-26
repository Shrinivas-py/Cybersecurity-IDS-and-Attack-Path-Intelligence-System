package com.graphshield.repository;

import com.graphshield.entity.Edge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EdgeRepository extends JpaRepository<Edge, Integer> {
    List<Edge> findByNetworkIdAndIsActiveTrue(Integer networkId);
    List<Edge> findBySourceId(Integer sourceId);
    List<Edge> findByTargetId(Integer targetId);
    List<Edge> findByNetworkId(Integer networkId);
}