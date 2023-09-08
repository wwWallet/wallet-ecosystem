import { injectable } from "inversify";
import 'reflect-metadata';
import { CredentialIssuersRepository } from "../lib/CredentialIssuersRepository";


@injectable()
export class CredentialIssuersConfigurationService {


	public registeredCredentialIssuerRepository(): CredentialIssuersRepository {
		return new CredentialIssuersRepository([]);
	}
}