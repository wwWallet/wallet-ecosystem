	/**
	 * Set to **true** only in the case where
	 * **id_token** or **vp_token** is enough for authenticating the user and the Authorization Server
	 * should not ask for consent (User will not see the "Consent" page to select credentials).
	 * 
	 * For EBSI conformance tests, it should be set to true
	 */
export const SKIP_CONSENT = false;
export const REQUIRE_PIN = true;