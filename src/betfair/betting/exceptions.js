const JSON_RPCExceptions = {
    "-32700": "Invalid JSON was received by the server. An error occurred on the server while parsing the JSoN text",
    "-32601": "Method not found",
    "-32602": "Problem parsing the parameters, or a mandatory parameter was not found",
    "-32603": "Internal JSON-RPC error"
};

export function APINGException(error, operation) {
    const { errorCode } = error.data.APINGException;
    const errorDescription = APINGExceptions[errorCode];
    const jsonRpcException = JSON_RPCExceptions[String(error.code)];

    this.code = errorCode;
    this.operation = operation;
    this.message = `The operation ${operation} failed because: ${errorDescription}${(jsonRpcException) ? ` and ${jsonRpcException}` : ""}`;
    this.stack = new Error().stack;
};

export function PlaceExecutionReport(error, operation) {
    const { errorCode } = error;
    const errorDescription = ExecutionReportErrorCodes[errorCode];

    let instructionReportErrors = [];

    if (error.instructionReports) {
        error.instructionReports.forEach(report => instructionReportErrors.push(InstructionReportErrorCode[report.errorCode]));
    }

    this.code = errorCode;
    this.operation = operation;
    this.message = `The operation ${operation} failed because: ${errorDescription}${(instructionReportErrors.length) ? ` with the instruction error(s): ${JSON.stringify(instructionReportErrors)}` : ""}`;
    this.stack = new Error().stack;
};