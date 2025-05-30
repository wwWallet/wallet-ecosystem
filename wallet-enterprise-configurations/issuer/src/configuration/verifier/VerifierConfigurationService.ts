import { injectable } from "inversify";
import { OpenidForPresentationsConfiguration } from "../../services/types/OpenidForPresentationsConfiguration.type";
import { authorizationServerMetadataConfiguration } from "../../authorizationServiceConfiguration";
import { config } from "../../../config";
import { VerifierConfigurationInterface } from "../../services/interfaces";
import "reflect-metadata";


@injectable()
export class VerifierConfigurationService implements VerifierConfigurationInterface {


	getPresentationDefinitions(): any[] {
		return [
			{
				"id": "PidWithDocumentNumber",
				"format": { "vc+sd-jwt": { alg: [ 'ES256' ] } },
				"input_descriptors": [
					{
						"id": "PID",
						"purpose": "You need to present your PID to prove your identity",
						"format": { "vc+sd-jwt": { alg: [ 'ES256' ] } },
						"constraints": {
							"fields": [
								{
									"name": "Last Name",
									"path": [
										"$.family_name"
									],
									"filter": {}
								},
								{
									"name": "First Name",
									"path": [
										"$.given_name"
									],
									"filter": {}
								},
								{
									"name": "Date of Birth",
									"path": [
										"$.birth_date"
									],
									"filter": {}
								},
								{
									"name": "Birth place",
									"path": [
										"$.birth_place"
									],
									"filter": {}
								},
								{
									"name": "Nationality",
									"path": [
										"$.nationality"
									],
									"filter": {}
								},
								{
									"name": "Expiry date",
									"path": [
										"$.expiry_date"
									],
									"filter": {}
								},
								{
									"name": "Issuing authority",
									"path": [
										"$.issuing_authority"
									],
									"filter": {}
								},
								{
									"name": "Issuing country",
									"path": [
										"$.issuing_country"
									],
									"filter": {}
								},
								{
									"name": "Credential Type",
									"path": [
										"$.vct"
									],
									"filter": {
										"type": "string",
										"const": "urn:eu.europa.ec.eudi:pid:1"
									}
								}
								{
									"name": "Document Number",
									"path": [
										"$.document_number"
									],
									"filter": {}
								},
							]
						}
					}
				]
			},

			{
				"id": "PidMinimal",
				"format": { "vc+sd-jwt": { alg: [ 'ES256' ] } },
				"input_descriptors": [
					{
						"id": "PID",
						"purpose": "You need to present your PID to prove your identity",
						"format": { "vc+sd-jwt": { alg: [ 'ES256' ] } },
						"constraints": {
							"fields": [
								{
									"name": "Last Name",
									"path": [
										"$.family_name"
									],
									"filter": {}
								},
								{
									"name": "First Name",
									"path": [
										"$.given_name"
									],
									"filter": {}
								},
								{
									"name": "Date of Birth",
									"path": [
										"$.birth_date"
									],
									"filter": {}
								},
								{
									"name": "Birth place",
									"path": [
										"$.birth_place"
									],
									"filter": {}
								},
								{
									"name": "Nationality",
									"path": [
										"$.nationality"
									],
									"filter": {}
								},
								{
									"name": "Expiry date",
									"path": [
										"$.expiry_date"
									],
									"filter": {}
								},
								{
									"name": "Issuing authority",
									"path": [
										"$.issuing_authority"
									],
									"filter": {}
								},
								{
									"name": "Issuing country",
									"path": [
										"$.issuing_country"
									],
									"filter": {}
								},
								{
									"name": "Credential Type",
									"path": [
										"$.vct"
									],
									"filter": {
										"type": "string",
										"const": "urn:eu.europa.ec.eudi:pid:1"
									}
								}
							]
						}
					}
				]
			}
		]
	}

	getConfiguration(): OpenidForPresentationsConfiguration {
		return {
			baseUrl: config.url,
			client_id: authorizationServerMetadataConfiguration.authorization_endpoint,
			redirect_uri: config.url + "/verification/direct_post",
			authorizationServerWalletIdentifier: "authorization_server",
		}
	}

}
