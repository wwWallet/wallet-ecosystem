import { injectable } from "inversify";
import { OpenidForPresentationsConfiguration } from "../../services/types/OpenidForPresentationsConfiguration.type";
import { authorizationServerMetadataConfiguration } from "../../authorizationServiceConfiguration";
import { config } from "../../../config";
import { VerifierConfigurationInterface } from "../../services/interfaces";
import "reflect-metadata";


export type DcqlClaim = {
  id?: string;                               // REQUIRED only if using claim_sets, OPTIONAL otherwise
  path: string[];
  values?: (string | number | boolean)[];    // optional value matching
  intent_to_retain?: boolean;                // ISO mdoc-specific extension
};


export type DcqlCredentialQuery = {
  id: string;
  format: "dc+sd-jwt" | "mso_mdoc";
  multiple?: boolean;
  meta: {
    vct_values?: string[];				 // SD-JWT VC
    doctype_value?: string;				 // ISO mdoc
  };
  trusted_authorities?: any;
  require_cryptographic_holder_binding?: boolean;
  claims?: DcqlClaim[];
  claim_sets?: string[][];
};

export type DcqlCredentialSetQuery = {
  options: string[][];
  required?: boolean;
};

export type DcqlQuery = {
  credentials: DcqlCredentialQuery[];
  credential_sets?: DcqlCredentialSetQuery[];
};

const pidSdJwtClaims: DcqlClaim[] = [
  { path: ["given_name"] },
  { path: ["birth_given_name"] },
  { path: ["family_name"] },
  { path: ["birth_family_name"] },
  { path: ["birthdate"] },
  { path: ["place_of_birth", "country"] },
  { path: ["place_of_birth", "region"] },
  { path: ["place_of_birth", "locality"] },

  { path: ["nationalities"] },
  { path: ["personal_administrative_number"] },
  { path: ["sex"] },

  { path: ["address", "formatted"] },
  { path: ["address", "street_address"] },
  { path: ["address", "house_number"] },
  { path: ["address", "postal_code"] },
  { path: ["address", "locality"] },
  { path: ["address", "region"] },
  { path: ["address", "country"] },

  { path: ["age_equal_or_over", "14"] },
  { path: ["age_equal_or_over", "16"] },
  { path: ["age_equal_or_over", "18"] },
  { path: ["age_equal_or_over", "21"] },
  { path: ["age_equal_or_over", "65"] },

  { path: ["age_in_years"] },
  { path: ["age_birth_year"] },

  { path: ["email"] },
  { path: ["phone_number"] },

  { path: ["issuing_authority"] },
  { path: ["issuing_country"] },
  { path: ["issuing_jurisdiction"] },

  { path: ["date_of_expiry"] },
  { path: ["date_of_issuance"] },
  { path: ["document_number"] },
  { path: ["picture"] },
];

const minimalPidSdJwtClaims: DcqlClaim[] = [
  { path: ["given_name"] },
  { path: ["family_name"] },
  { path: ["birthdate"] },
  { path: ["nationalities"] },
  { path: ["date_of_expiry"] },
  { path: ["issuing_authority"] },
  { path: ["issuing_country"] },
];

const pidMdocClaims: DcqlClaim[] = [
  {
    path: ["eu.europa.ec.eudi.pid.1", "family_name"],
    intent_to_retain: false,
  },
  {
    path: ["eu.europa.ec.eudi.pid.1", "family_name_birth"],
    intent_to_retain: false,
  },
  {
    path: ["eu.europa.ec.eudi.pid.1", "given_name"],
    intent_to_retain: false,
  },
  {
    path: ["eu.europa.ec.eudi.pid.1", "given_name_birth"],
    intent_to_retain: false,
  },
  {
    path: ["eu.europa.ec.eudi.pid.1", "personal_administrative_number"],
    intent_to_retain: false,
  },
  {
    path: ["eu.europa.ec.eudi.pid.1", "birth_date"],
    intent_to_retain: false,
  },
  {
    path: ["eu.europa.ec.eudi.pid.1", "age_over_18"],
    intent_to_retain: false,
  },
  {
    path: ["eu.europa.ec.eudi.pid.1", "age_over_21"],
    intent_to_retain: false,
  },
  {
    path: ["eu.europa.ec.eudi.pid.1", "age_in_years"],
    intent_to_retain: false,
  },
  {
    path: ["eu.europa.ec.eudi.pid.1", "birth_place"],
    intent_to_retain: false,
  },
  {
    path: ["eu.europa.ec.eudi.pid.1", "resident_address"],
    intent_to_retain: false,
  },
  {
    path: ["eu.europa.ec.eudi.pid.1", "resident_country"],
    intent_to_retain: false,
  },
  {
    path: ["eu.europa.ec.eudi.pid.1", "resident_state"],
    intent_to_retain: false,
  },
  {
    path: ["eu.europa.ec.eudi.pid.1", "resident_city"],
    intent_to_retain: false,
  },
  {
    path: ["eu.europa.ec.eudi.pid.1", "resident_postal_code"],
    intent_to_retain: false,
  },
  {
    path: ["eu.europa.ec.eudi.pid.1", "resident_street"],
    intent_to_retain: false,
  },
  {
    path: ["eu.europa.ec.eudi.pid.1", "resident_house_number"],
    intent_to_retain: false,
  },
  {
    path: ["eu.europa.ec.eudi.pid.1", "email_address"],
    intent_to_retain: false,
  },
  {
    path: ["eu.europa.ec.eudi.pid.1", "mobile_phone_number"],
    intent_to_retain: false,
  },
  {
    path: ["eu.europa.ec.eudi.pid.1", "issuing_authority"],
    intent_to_retain: false,
  },
  {
    path: ["eu.europa.ec.eudi.pid.1", "issuing_country"],
    intent_to_retain: false,
  },
  {
    path: ["eu.europa.ec.eudi.pid.1", "issuing_jurisdiction"],
    intent_to_retain: false,
  },
];

const bachelorSdJwtClaims: DcqlClaim[] = [
  { path: ["grade"] },
  { path: ["eqf_level"] },
  { path: ["title"] },
];

const ehicSdJwtClaims: DcqlClaim[] = [
  { path: ["personal_administrative_number"] },
  { path: ["document_number"] },
  { path: ["issuing_country"] },
	{ path: ["issuing_authority", "id"] },
	{ path: ["issuing_authority", "name"] },
	{ path: ["authentic_source", "id"] },
	{ path: ["authentic_source", "name"] },
	{ path: ["starting_date"] },
	{ path: ["ending_date"] },
	{ path: ["date_of_expiry"] },
	{ path: ["date_of_issuance"] },
];

const porSdJwtClaims: DcqlClaim[] = [
	{ path: ["legal_person_identifier"] }, // Legal entity ID
	{ path: ["legal_name"] },              // Legal entity name
	{ path: ["full_powers"] },             // Full Representation Powers
	{ path: ["eService"] },                // Designated eService
	{ path: ["effective_from_date"] },
	{ path: ["effective_until_date"] },
];


const pidSdJwtCredentialQuery: DcqlCredentialQuery = {
  id: "pidSdJwt",
  format: "dc+sd-jwt",
  meta: {
    vct_values: ["urn:eudi:pid:1"],
  },
  claims: pidSdJwtClaims,
};

const minimalPidSdJwtCredentialQuery: DcqlCredentialQuery = {
  id: "minimalSdJwtPID",
  format: "dc+sd-jwt",
  meta: {
    vct_values: ["urn:eudi:pid:1"],
  },
  claims: minimalPidSdJwtClaims,
};

const pidMdocCredentialQuery: DcqlCredentialQuery = {
  id: "pidMsoMdoc",
  format: "mso_mdoc",
  meta: {
    doctype_value: "eu.europa.ec.eudi.pid.1",
  },
  claims: pidMdocClaims,
};

const bachelorCredentialQuery: DcqlCredentialQuery = {
  id: "Bachelor",
  format: "dc+sd-jwt",
  meta: {
    vct_values: ["urn:credential:diploma"],
  },
  claims: bachelorSdJwtClaims,
};

const europeanHealthInsuranceCardCredentialQuery: DcqlCredentialQuery = {
  id: "EuropeanHealthInsuranceCard",
  format: "dc+sd-jwt",
  meta: {
    vct_values: ["urn:eudi:ehic:1"],
  },
  claims: ehicSdJwtClaims,
};

const porCredentialQuery: DcqlCredentialQuery = {
  id: "POR",
  format: "dc+sd-jwt",
  meta: {
    vct_values: ["urn:eu.europa.ec.eudi:por:1"],
  },
  claims: porSdJwtClaims
};

const customPidDcqlQuery: DcqlQuery = {
  credentials: [
    pidSdJwtCredentialQuery,
    pidMdocCredentialQuery,
  ]
};

const bachelorDcqlQuery: DcqlQuery = {
  credentials: [bachelorCredentialQuery],
};

const europeanHealthInsuranceCardDcqlQuery: DcqlQuery = {
  credentials: [europeanHealthInsuranceCardCredentialQuery],
};

const minimalPidAndEuropeanHealthInsuranceCardDcqlQuery: DcqlQuery = {
  credentials: [
    minimalPidSdJwtCredentialQuery,
    europeanHealthInsuranceCardCredentialQuery,
  ],
  credential_sets: [
    {
      options: [
        [minimalPidSdJwtCredentialQuery.id, europeanHealthInsuranceCardCredentialQuery.id],
      ],
      required: true,
    },
  ],
};

const minimalPidAndPorDcqlQuery: DcqlQuery = {
  credentials: [
    minimalPidSdJwtCredentialQuery,
    porCredentialQuery,
  ],
  credential_sets: [
    {
      options: [
        [minimalPidSdJwtCredentialQuery.id, porCredentialQuery.id],
      ],
      required: true,
    },
  ],
};

const minimalPidAndBachelorDcqlQuery: DcqlQuery = {
  credentials: [
    minimalPidSdJwtCredentialQuery,
    bachelorCredentialQuery,
  ],
  credential_sets: [
    {
      options: [
        [minimalPidSdJwtCredentialQuery.id, bachelorCredentialQuery.id],
      ],
      required: true,
    },
  ],
};

@injectable()
export class VerifierConfigurationService implements VerifierConfigurationInterface {
  getPresentationDefinitions(): any[] {
    return [
      {
        id: "CustomPid",
        title: "PID",
        description: "Select the format and the fields you want to request",
        _selectable: true,
        dcql_query: customPidDcqlQuery,
      },
      {
        id: bachelorDcqlQuery.credentials[0].id,
        title: "Bachelor Diploma",
        description: "Select the fields you want to request",
        _selectable: true,
        dcql_query: bachelorDcqlQuery,
      },
      {
        id: europeanHealthInsuranceCardDcqlQuery.credentials[0].id,
        title: "EHIC",
        description: "Select the fields you want to request",
        _selectable: true,
        dcql_query: europeanHealthInsuranceCardDcqlQuery,
      },
      {
        id: "MinimalPIDAndEuropeanHealthInsuranceCard",
        title: "PID + EHIC",
        description: "Request a PID along with an EHIC",
        dcql_query: minimalPidAndEuropeanHealthInsuranceCardDcqlQuery,
      },
      {
        id: "MinimalPIDAndPOR",
        title: "PID + POR",
        description: "Request a PID along with a POR",
        dcql_query: minimalPidAndPorDcqlQuery,
      },
      {
        id: "MinimalPIDAndBachelorDiploma",
        title: "PID + Diploma",
        description: "Request a PID along with a Bachelor Diploma",
        dcql_query: minimalPidAndBachelorDcqlQuery,
      },
      {
        // QES Transaction data
        id: "MinimalPIDwithTransactionDataQES",
        title: "PID with QES Authorization Transaction Data",
        purpose: "Document Signing",
        description:
          "Format: dc+sd-jwt - Transaction Data Type: https://cloudsignatureconsortium.org/2025/qes. " +
          "The user will be requested to authorize the QTSP to create QES for the document 'Personal Loan Agreement'",
        dcql_query: minimalPidSdJwtCredentialQuery,
        _transaction_data_type: "https://cloudsignatureconsortium.org/2025/qes",
      },
      {
        // QC Request Transaction data
        id: "MinimalPIDwithTransactionDataQCRequest",
        title: "PID with QC Request Transaction Data",
        purpose: "Creation of Signature Certificate",
        description:
          "Format: dc+sd-jwt - Transaction Data Type: https://cloudsignatureconsortium.org/2025/qc-request. " +
          "The user will be requested to give consent for the creation of signature certificates according to the T&C of the QTSP",
        dcql_query: minimalPidSdJwtCredentialQuery,
        _transaction_data_type: "https://cloudsignatureconsortium.org/2025/qc-request",
      },
			// {
      //   // example with Transaction Data
      //   id: "MinimalPIDwithTransactionData",
      //   title: "MinimalPID with Example Transaction Data",
      //   description: "PID fields: Given Name, Family Name, Birth Date, Nationality, Exp. Date, Issuing Authority, Issuing Country. Transaction Data Type: 'urn:wwwallet:example_transaction_data_type'",
      //   purpose: "Creation of Signature Certificate",
      //   dcql_query: minimalPidSdJwtCredentialQuery,
      //   _transaction_data_type: "urn:wwwallet:example_transaction_data_type",
      // },
    ];
  }

  getConfiguration(): OpenidForPresentationsConfiguration {
    return {
      baseUrl: config.url,
      client_id: authorizationServerMetadataConfiguration.authorization_endpoint,
      redirect_uri: config.url + "/verification/direct_post",
      authorizationServerWalletIdentifier: "authorization_server",
    };
  }
}
