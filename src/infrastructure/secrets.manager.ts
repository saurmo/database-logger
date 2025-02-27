import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

// Configurar el cliente de Secrets Manager
const secretsManagerClient = new SecretsManagerClient({});

/**
 * Obtiene el secreto desde AWS Secrets Manager
 * @param secretName Nombre del secreto en AWS Secrets Manager
 * @returns El valor del secreto como string o JSON
 */
export const getSecret = async (secretName: string): Promise<string | Record<string, unknown> | undefined> => {
  try {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response = await secretsManagerClient.send(command);
    // Si el secreto está en formato JSON, parsearlo
    if (response.SecretString) {
      try {
        return JSON.parse(response.SecretString);
      } catch {
        return response.SecretString; // Si no es JSON, devolver como string
      }
    }
    throw new Error("SecretString is undefined.");
  } catch (error) {
    console.info("Error fetching secret", error);
    return undefined
  }
};
