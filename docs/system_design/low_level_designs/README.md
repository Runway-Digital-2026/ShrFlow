# Low-Level Design (LLD) Specifications & Component Index

This register serves as the central index and architectural repository for all component-level Low-Level Designs (LLDs) of the **ShrFlow** platform. 

Every component listed in the index below contains a detailed, low-level engineering specification outlining:

1.  **Objective & Scope:** Core capabilities and bounds of the component.
2.  **API Contract & Validation Schema:** Strict endpoint parameters, request/response formats, and headers.
3.  **Database Schema & Migration SQL:** Exact tables, constraints, keys, indexes, and Row-Level Security (RLS) policies.
4.  **Class Design & Component Interface:** Skeletons, class relationships, methods, and design patterns (e.g., Outbox, Strategy, Pooler).
5.  **Execution Logic:** Step-by-step pseudo-code detailing locking mechanisms, loops, transaction boundaries, and state machines.
6.  **Error & Recovery Matrix:** Specific exceptions, logging contexts, and fallback recovery paths.

---

## 4. LLD Feature Backlog Index

Developers can select a feature from the list below, write the LLD under `/docs/system_design/low_level_designs/<category_folder>/`, get team approval, and then proceed with the coding tasks:

### 4.1. Tenancy, Authentication & Identity
*   [ ] JWT Verification & Route Guard Middleware $\rightarrow$ [01_jwt_guard_middleware.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/01_tenancy_auth_identity/01_jwt_guard_middleware.md)
*   [ ] PostgreSQL RLS Connection Manager $\rightarrow$ [02_rls_pool_manager.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/01_tenancy_auth_identity/02_rls_pool_manager.md)
*   [ ] Onboarding Workspace Wizard $\rightarrow$ [03_onboarding_workspace_wizard.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/01_tenancy_auth_identity/03_onboarding_workspace_wizard.md)
*   [ ] Workspace Member Invitation System $\rightarrow$ [04_workspace_member_invitation_system.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/01_tenancy_auth_identity/04_workspace_member_invitation_system.md)
*   [ ] Multi-Factor Authentication (MFA) Service $\rightarrow$ [05_mfa_service.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/01_tenancy_auth_identity/05_mfa_service.md)
*   [ ] Immutable Audit Log Writer $\rightarrow$ [06_immutable_audit_log_writer.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/01_tenancy_auth_identity/06_immutable_audit_log_writer.md)

### 4.2. Contacts & Audience Ingestion Engine
*   [ ] Direct-to-Storage CSV/XLSX Ingest API $\rightarrow$ [07_direct_s3_uploader.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/02_contacts_audience_ingestion/07_direct_s3_uploader.md)
*   [ ] Asynchronous Ingestion Ingestion Worker $\rightarrow$ [08_async_ingestion_worker.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/02_contacts_audience_ingestion/08_async_ingestion_worker.md)
*   [ ] Real-Time Lead Sync Endpoint (POST /v1/contacts) $\rightarrow$ [09_real_time_lead_sync_endpoint.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/02_contacts_audience_ingestion/09_real_time_lead_sync_endpoint.md)
*   [ ] Syntax, MX, & Disposable Domain Validator $\rightarrow$ [10_email_domain_validator.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/02_contacts_audience_ingestion/10_email_domain_validator.md)
*   [ ] Engagement Scorer Background Worker $\rightarrow$ [11_engagement_scorer_worker.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/02_contacts_audience_ingestion/11_engagement_scorer_worker.md)
*   [ ] GDPR Anonymization Service $\rightarrow$ [12_gdpr_anonymization_service.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/02_contacts_audience_ingestion/12_gdpr_anonymization_service.md)
*   [ ] Suppression List & Suppression Manager $\rightarrow$ [13_suppression_list_manager.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/02_contacts_audience_ingestion/13_suppression_list_manager.md)

### 4.3. Template Engine & Visual Studio
*   [ ] Visual Design JSON Store $\rightarrow$ [14_visual_design_json_store.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/03_template_engine_visual_studio/14_visual_design_json_store.md)
*   [ ] Stateless MJML Compilation Microservice $\rightarrow$ [15_stateless_mjml_compiler.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/03_template_engine_visual_studio/15_stateless_mjml_compiler.md)
*   [ ] Asset CDN & Reference Tracker $\rightarrow$ [16_asset_cdn_reference_tracker.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/03_template_engine_visual_studio/16_asset_cdn_reference_tracker.md)
*   [ ] Template Versioning & Patch Diffing Service $\rightarrow$ [17_template_versioning_diff_service.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/03_template_engine_visual_studio/17_template_versioning_diff_service.md)
*   [ ] Headless Library Thumbnail Worker $\rightarrow$ [18_headless_thumbnail_worker.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/03_template_engine_visual_studio/18_headless_thumbnail_worker.md)

### 4.4. Campaign Orchestration Engine
*   [ ] Optimistic Locking Draft Version Guard $\rightarrow$ [19_optimistic_locking_draft_guard.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/04_campaign_orchestration/19_optimistic_locking_draft_guard.md)
*   [ ] Spintax & Personalization Token Resolver $\rightarrow$ [20_spintax_personalization_resolver.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/04_campaign_orchestration/20_spintax_personalization_resolver.md)
*   [ ] Pre-Send Integrity Validation Gate $\rightarrow$ [21_pre_send_integrity_validation_gate.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/04_campaign_orchestration/21_pre_send_integrity_validation_gate.md)
*   [ ] Timezone-Aware Campaign Scheduler $\rightarrow$ [22_timezone_campaign_scheduler.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/04_campaign_orchestration/22_timezone_campaign_scheduler.md)
*   [ ] Bayesian A/B/n Multi-Armed Bandit Tester $\rightarrow$ [23_bayesian_ab_testing_bandit.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/04_campaign_orchestration/23_bayesian_ab_testing_bandit.md)

### 4.5. Deliverability & Dispatch Engine
*   [ ] Outbox Pattern Transaction Manager $\rightarrow$ [24_outbox_transaction_manager.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/05_deliverability_dispatch/24_outbox_transaction_manager.md)
*   [ ] SMTP / AWS SES Dual-Path Router $\rightarrow$ [25_sending_path_router.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/05_deliverability_dispatch/25_sending_path_router.md)
*   [ ] Redis-Backed Token Bucket Rate Limiter $\rightarrow$ [26_redis_rate_limiter.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/05_deliverability_dispatch/26_redis_rate_limiter.md)
*   [ ] Persistent SMTP Connection Pooler $\rightarrow$ [27_smtp_connection_pooler.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/05_deliverability_dispatch/27_smtp_connection_pooler.md)
*   [ ] Automated Domain Warmup Scheduler $\rightarrow$ [28_domain_warmup_scheduler.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/05_deliverability_dispatch/28_domain_warmup_scheduler.md)

### 4.6. Observability, Telemetry & Webhooks
*   [ ] HMAC Open-Tracking Pixel Validator $\rightarrow$ [29_open_tracking_pixel_validator.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/06_observability_telemetry_webhooks/29_open_tracking_pixel_validator.md)
*   [ ] Redirect Link Telemetry Wrapper $\rightarrow$ [30_redirect_link_telemetry_wrapper.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/06_observability_telemetry_webhooks/30_redirect_link_telemetry_wrapper.md)
*   [ ] Bot & Proxy Filter Service $\rightarrow$ [31_bot_proxy_filter_service.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/06_observability_telemetry_webhooks/31_bot_proxy_filter_service.md)
*   [ ] Click Heatmap Aggregator $\rightarrow$ [32_click_heatmap_aggregator.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/06_observability_telemetry_webhooks/32_click_heatmap_aggregator.md)
*   [ ] Time-Spent Tracking Telemetry $\rightarrow$ [33_time_spent_tracking_telemetry.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/06_observability_telemetry_webhooks/33_time_spent_tracking_telemetry.md)
*   [ ] Outbound HMAC Webhook Dispatcher $\rightarrow$ [34_outbound_hmac_webhook_dispatcher.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/06_observability_telemetry_webhooks/34_outbound_hmac_webhook_dispatcher.md)

### 4.7. Artificial Intelligence & RAG Engine
*   [ ] Model Context Protocol (FastMCP) Server Endpoint $\rightarrow$ [35_fastmcp_server_endpoint.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/07_ai_rag_engine/35_fastmcp_server_endpoint.md)
*   [ ] Asynchronous Vector Data Ingestion Worker $\rightarrow$ [36_async_vector_data_ingestion_worker.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/07_ai_rag_engine/36_async_vector_data_ingestion_worker.md)
*   [ ] Semantic Similarity Search Endpoint $\rightarrow$ [37_semantic_similarity_search_endpoint.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/07_ai_rag_engine/37_semantic_similarity_search_endpoint.md)
*   [ ] Local 1.5B LLM RAG Chatbot Widget $\rightarrow$ [38_local_mcp_rag_inference.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/07_ai_rag_engine/38_local_mcp_rag_inference.md)
*   [ ] Natural Language Segment Generator $\rightarrow$ [39_natural_language_segment_generator.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/07_ai_rag_engine/39_natural_language_segment_generator.md)
*   [ ] Deliverability SMTP Explainer Modal $\rightarrow$ [40_deliverability_smtp_explainer_modal.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/07_ai_rag_engine/40_deliverability_smtp_explainer_modal.md)
*   [ ] Multi-Language "Smart Translation" Service $\rightarrow$ [41_smart_translation_service.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/07_ai_rag_engine/41_smart_translation_service.md)
*   [ ] Machine Learning Send-Time Optimizer (STO) $\rightarrow$ [42_ml_send_time_optimizer.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/07_ai_rag_engine/42_ml_send_time_optimizer.md)
*   [ ] Bayesian Multi-Armed Bandit A/B Tester $\rightarrow$ [43_bayesian_bandit_ab_tester.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/07_ai_rag_engine/43_bayesian_bandit_ab_tester.md)
*   [ ] Smart Subject Line Generator $\rightarrow$ [44_smart_subject_line_generator.md](file:///Users/rahul/Desktop/ShrFlow/docs/system_design/low_level_designs/07_ai_rag_engine/44_smart_subject_line_generator.md)
