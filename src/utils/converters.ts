import { convertCredentialSubject } from '@unumid/server-sdk';
import { CredentialPb, ProofPb } from '@unumid/types';
import { CredentialStatus } from '@unumid/types/build/protos/credential';
import { CredentialEntityOptions } from '../entities/Credential';

export const convertCredentialToCredentialEntityOptions = (credential: CredentialPb): CredentialEntityOptions => {
  const proof: ProofPb = {
    ...credential.proof,
    created: credential.proof?.created,
    signatureValue: (credential.proof?.signatureValue as string),
    type: credential.proof?.type as string,
    verificationMethod: credential.proof?.verificationMethod as string,
    proofPurpose: credential.proof?.proofPurpose as string
  };

  return {
    credentialContext: (credential.context as ['https://www.w3.org/2018/credentials/v1', ...string[]]), // the proto type def can not have constants, but the value is ensured prior to sending to saas for encrypted persistence.
    credentialId: credential.id,
    credentialCredentialSubject: convertCredentialSubject(credential.credentialSubject),
    credentialCredentialStatus: (credential.credentialStatus as CredentialStatus),
    credentialIssuer: credential.issuer,
    credentialType: (credential.type as ['VerifiableCredential', ...string[]]), // the proto type def can not have constants, but the value is ensured prior to sending to saas for encrypted persistence.
    credentialIssuanceDate: credential.issuanceDate as Date,
    credentialExpirationDate: credential.expirationDate,
    credentialProof: proof
  };
};
