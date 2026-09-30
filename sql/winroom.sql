-- Winroom capture desk — MySQL schema
-- Database: winroom (see DB_NAME in .env.local)

CREATE TABLE IF NOT EXISTS schema_migrations (
  version INT PRIMARY KEY,
  applied_at VARCHAR(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at VARCHAR(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS company_profile (
  id INT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  clearance VARCHAR(255) NOT NULL,
  past_performance TEXT NOT NULL,
  CONSTRAINT chk_company_profile_id CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS profile_tags (
  kind ENUM('naics', 'vehicle', 'geo', 'keyword') NOT NULL,
  value VARCHAR(255) NOT NULL,
  PRIMARY KEY (kind, value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS billing (
  id INT PRIMARY KEY,
  plan ENUM('pilot', 'desk', 'enterprise') NOT NULL,
  seats INT NOT NULL,
  rfp_quota INT NOT NULL,
  rfps_used INT NOT NULL DEFAULT 0,
  CONSTRAINT chk_billing_id CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS connectors (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  connected TINYINT(1) NOT NULL DEFAULT 0,
  webhook VARCHAR(512) NOT NULL DEFAULT '',
  last_sync VARCHAR(40) NULL,
  last_count INT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS automations (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  cadence VARCHAR(255) NOT NULL,
  last_run VARCHAR(40) NULL,
  last_result TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS workflows (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('idle', 'running', 'done') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS workflow_nodes (
  workflow_id VARCHAR(64) NOT NULL,
  id VARCHAR(64) NOT NULL,
  label VARCHAR(255) NOT NULL,
  status ENUM('pending', 'running', 'done') NOT NULL,
  sort_order INT NOT NULL,
  PRIMARY KEY (workflow_id, id),
  CONSTRAINT fk_workflow_nodes_workflow FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS team_members (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  focus VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(64) NOT NULL,
  availability ENUM('available', 'in-orals', 'on-deadline') NOT NULL,
  bio TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bids (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(512) NOT NULL,
  rfp_id VARCHAR(128) NOT NULL,
  agency VARCHAR(255) NOT NULL,
  jurisdiction VARCHAR(255) NOT NULL,
  value VARCHAR(128) NOT NULL,
  value_mid DOUBLE NOT NULL,
  duration VARCHAR(64) NOT NULL,
  bidders INT NOT NULL,
  due_label VARCHAR(64) NOT NULL,
  win_probability INT NOT NULL,
  status ENUM('hot', 'due', 'analyzing', 'qualified', 'watching', 'no-go', 'submitted') NOT NULL,
  highlight TEXT NOT NULL,
  naics VARCHAR(32) NOT NULL,
  set_aside VARCHAR(128) NOT NULL,
  source ENUM('seed', 'discovery', 'upload') NOT NULL,
  pinned TINYINT(1) NOT NULL DEFAULT 0,
  crm_synced VARCHAR(64) NULL,
  created_at VARCHAR(40) NOT NULL,
  CONSTRAINT fk_bids_connector FOREIGN KEY (crm_synced) REFERENCES connectors(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS team_assignments (
  member_id VARCHAR(64) NOT NULL,
  bid_id VARCHAR(64) NOT NULL,
  PRIMARY KEY (member_id, bid_id),
  CONSTRAINT fk_assign_member FOREIGN KEY (member_id) REFERENCES team_members(id) ON DELETE CASCADE,
  CONSTRAINT fk_assign_bid FOREIGN KEY (bid_id) REFERENCES bids(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bid_documents (
  bid_id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(512) NOT NULL,
  rfp_id VARCHAR(128) NOT NULL,
  agency VARCHAR(255) NOT NULL,
  pages INT NOT NULL,
  raw_text LONGTEXT NOT NULL,
  uploaded_name VARCHAR(512) NULL,
  CONSTRAINT fk_documents_bid FOREIGN KEY (bid_id) REFERENCES bids(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS document_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bid_id VARCHAR(64) NOT NULL,
  sort_order INT NOT NULL,
  heading VARCHAR(512) NOT NULL,
  body_json LONGTEXT NOT NULL,
  CONSTRAINT fk_sections_bid FOREIGN KEY (bid_id) REFERENCES bid_documents(bid_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS matrix_items (
  id VARCHAR(64) PRIMARY KEY,
  bid_id VARCHAR(64) NOT NULL,
  requirement TEXT NOT NULL,
  section VARCHAR(255) NOT NULL,
  owner_id VARCHAR(64) NULL,
  status ENUM('open', 'in-progress', 'met', 'gap') NOT NULL,
  citation TEXT NOT NULL,
  CONSTRAINT fk_matrix_bid FOREIGN KEY (bid_id) REFERENCES bids(id) ON DELETE CASCADE,
  CONSTRAINT fk_matrix_owner FOREIGN KEY (owner_id) REFERENCES team_members(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS go_no_go (
  bid_id VARCHAR(64) PRIMARY KEY,
  decision ENUM('go', 'conditional', 'no-go') NOT NULL,
  score INT NOT NULL,
  updated_at VARCHAR(40) NOT NULL,
  CONSTRAINT fk_gonogo_bid FOREIGN KEY (bid_id) REFERENCES bids(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS go_no_go_reasons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bid_id VARCHAR(64) NOT NULL,
  sort_order INT NOT NULL,
  label VARCHAR(255) NOT NULL,
  score INT NOT NULL,
  note TEXT NOT NULL,
  CONSTRAINT fk_gonogo_reasons_bid FOREIGN KEY (bid_id) REFERENCES go_no_go(bid_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS proposals (
  id VARCHAR(64) PRIMARY KEY,
  bid_id VARCHAR(64) NOT NULL,
  title VARCHAR(512) NOT NULL,
  volume VARCHAR(64) NOT NULL,
  body LONGTEXT NOT NULL,
  status ENUM('draft', 'review', 'final') NOT NULL,
  updated_at VARCHAR(40) NOT NULL,
  CONSTRAINT fk_proposals_bid FOREIGN KEY (bid_id) REFERENCES bids(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vault_artifacts (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(512) NOT NULL,
  type ENUM('PDF', 'DOCX', 'XLSX', 'TXT') NOT NULL,
  size_label VARCHAR(64) NOT NULL,
  bid_id VARCHAR(64) NULL,
  updated_label VARCHAR(64) NOT NULL,
  classification ENUM('CUI', 'Internal') NOT NULL,
  body LONGTEXT NOT NULL,
  CONSTRAINT fk_artifacts_bid FOREIGN KEY (bid_id) REFERENCES bids(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS alerts (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(512) NOT NULL,
  body TEXT NOT NULL,
  href VARCHAR(512) NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  `read` TINYINT(1) NOT NULL DEFAULT 0,
  kind ENUM('deadline', 'discovery', 'sync', 'team', 'system') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leads (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  kind ENUM('contact', 'demo') NOT NULL,
  created_at VARCHAR(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_events (
  id VARCHAR(64) PRIMARY KEY,
  at VARCHAR(40) NOT NULL,
  action TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_bids_status ON bids(status);
CREATE INDEX idx_bids_agency ON bids(agency);
CREATE INDEX idx_bids_created ON bids(created_at);
CREATE INDEX idx_matrix_bid ON matrix_items(bid_id);
CREATE INDEX idx_proposals_bid ON proposals(bid_id);
CREATE INDEX idx_artifacts_bid ON vault_artifacts(bid_id);
CREATE INDEX idx_alerts_created ON alerts(created_at);
CREATE INDEX idx_users_email ON users(email);

-- Reset (manual): npm run db:reset
