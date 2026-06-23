ALTER TABLE payments
  ADD COLUMN `type` ENUM('PAYMENT','REFUND','PARTIAL_REFUND') NOT NULL DEFAULT 'PAYMENT' AFTER `user_id`,
  ADD COLUMN `refund_amount` DECIMAL(10,2) DEFAULT NULL AFTER `status`,
  ADD COLUMN `refund_status` VARCHAR(50) DEFAULT NULL AFTER `refund_amount`,
  ADD COLUMN `refund_date` DATETIME DEFAULT NULL AFTER `refund_status`,
  ADD COLUMN `refund_transaction_id` VARCHAR(255) DEFAULT NULL AFTER `refund_date`;
