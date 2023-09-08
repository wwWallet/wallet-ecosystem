import { Europass } from "./EuropassCredentialSubjectBuilder/EuropassCredentialSubjectBuilder";
import { SimpleDiplomaCredentialSubject } from "./SimpleDiplomaCredentialSubjectBuilder/SimpleDiplomaCredentialSubjectBuilder";

export type CredentialSubject = Europass | SimpleDiplomaCredentialSubject; // | StudentId | Europass | ...;