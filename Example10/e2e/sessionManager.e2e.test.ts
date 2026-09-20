import { expect } from "chai";
import { execSync } from "child_process";

const CONTAINER_NAME = "example10-app";

function dockerExec(args: string): string {
  return execSync(`docker ${args}`, { encoding: "utf-8" });
}

describe("E2E: SessionManager Docker Container", () => {
  before(function () {
    this.timeout(10000);
  });

  it("should have the container running", () => {
    const result = dockerExec(
      `ps --filter name=${CONTAINER_NAME} --format '{{.Names}}'`
    );
    expect(result.trim()).to.equal(CONTAINER_NAME);
  });

  it("should respond to basic connectivity check", () => {
    const logs = dockerExec(`logs ${CONTAINER_NAME} 2>&1`);
    expect(logs).to.include("SessionManager started");
  });

  it("should show session test-1 as valid in container logs", () => {
    const logs = dockerExec(`logs ${CONTAINER_NAME} 2>&1`);
    expect(logs).to.include("Session test-1 valid: true");
  });

  it("should show session count of 1", () => {
    const logs = dockerExec(`logs ${CONTAINER_NAME} 2>&1`);
    expect(logs).to.include("Sessions: 1");
  });
});
