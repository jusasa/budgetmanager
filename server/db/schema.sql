-- FinWise Asset Analytics MVP Database Schema (MySQL)
-- -------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS `finwise_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `finwise_db`;

-- 1. 통계청 공공 벤치마크 데이터 (가계동향조사 기반 소득 5분위 및 연령대별 통계)
CREATE TABLE IF NOT EXISTS `benchmark_stats` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `age_group` VARCHAR(20) NOT NULL COMMENT '연령대: 20s, 30s, 40s, 50s, all',
  `income_quintile` INT NOT NULL COMMENT '소득 5분위: 1 ~ 5',
  `avg_monthly_income` INT NOT NULL COMMENT '월평균 총소득(원)',
  `avg_monthly_expense` INT NOT NULL COMMENT '월평균 소비지출(원)',
  `avg_savings_rate` DECIMAL(5, 2) NOT NULL COMMENT '평균 저축률(%)',
  `food_ratio` DECIMAL(5, 2) NOT NULL COMMENT '식비 비중(%)',
  `housing_ratio` DECIMAL(5, 2) NOT NULL COMMENT '주거/수도/광열 비중(%)',
  `transport_ratio` DECIMAL(5, 2) NOT NULL COMMENT '교통/통신 비중(%)',
  `leisure_ratio` DECIMAL(5, 2) NOT NULL COMMENT '여가/문화/오락 비중(%)',
  `shopping_ratio` DECIMAL(5, 2) NOT NULL COMMENT '쇼핑/의류/미용 비중(%)',
  `other_ratio` DECIMAL(5, 2) NOT NULL COMMENT '기타 비중(%)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_age_quintile` (`age_group`, `income_quintile`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 사용자 동의 기반 익명 집계 통계 (식별 불가능한 집계 지표만 저장)
CREATE TABLE IF NOT EXISTS `anonymous_peer_stats` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `age_group` VARCHAR(20) NOT NULL,
  `monthly_income_bracket` VARCHAR(50) NOT NULL,
  `monthly_expense` INT NOT NULL,
  `savings_rate` DECIMAL(5, 2) NOT NULL,
  `top_spending_category` VARCHAR(50) NOT NULL,
  `peak_spending_time` VARCHAR(30) NOT NULL,
  `consented_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
