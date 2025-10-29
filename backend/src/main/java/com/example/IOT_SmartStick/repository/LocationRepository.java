package com.example.IOT_SmartStick.repository;

import com.example.IOT_SmartStick.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocationRepository extends JpaRepository<Location, Integer> {
}
