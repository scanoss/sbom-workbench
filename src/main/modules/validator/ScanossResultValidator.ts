
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  errorCount: number;
  getDetailedErrors(): { field: string; message: string; value: string; }[];
}

export class ValidationError extends Error {
  constructor(
    public cause: any,
    public message: string,
    public value?: string
) {
    super(`Validation error in field '${cause}': ${message} (value: ${value})`);
    this.name = 'ValidationError';
  }
}

export class ScanossResultValidator {

  private errors: ValidationError[];

  constructor() {
    this.errors = [];
  }

  // Main validation method
  validate(data): ValidationResult {
    this.errors = [];

    // Validate each file path and its results
    for (const [filePath, results] of Object.entries(data)) {
      this.validateFilePath(filePath);
      this.validateFileResults(filePath, results);
    }

    return this.getValidationResult();
  }

  // Validate if the key looks like a file path
  validateFilePath(path) {
    if (!path || typeof path !== 'string') {
      this.addError('file_path', 'file path must be a non-empty string', path);
      return;
    }
  }

  private validateMatchResults(filePath, results){
    if (!Array.isArray(results)) {
      this.addError(filePath, 'results must be an array', results);
      return;
    }

    if (results.length === 0) {
      this.addError(`${filePath}.results`, 'results array is empty', results);
      return;
    }

    results.forEach((result, index) => {
      this.validateFileResult(`file: ${filePath}, index: [${index}]`, result);
    });
  }

  private validateDependenciesResults(filePath:string, results: Array<any>){
    results.forEach((result, index) => {
      if (!result['dependencies']) {
        this.addError(`'${filePath}'[${index}]`, "required 'dependencies' key is missing", JSON.stringify(results,null,2));
        return;
      }
    });
  }

  // Validate the array of results for a file
  validateFileResults(filePath, results) {

    if (!Array.isArray(results)) {
      this.addError(`${filePath} results`, 'results must be an array', null);
      return;
    }

    if (results.length === 0) return;

    // No match
    if(results.some((r:any)=>r.id === 'none')) return;

    // Validate matches
    if (results.some((r: any)=>r.id === 'snippet' || r.id === 'file')) {
      this.validateMatchResults(filePath, results)
    }

    // Validate dependencies
    if (results.some((r:any)=>r.id === 'dependency')){
      this.validateDependenciesResults(filePath, results);
    }
  }

  // Validate a single file result
 private  validateFileResult(prefix, result) {
    if (!result || typeof result !== 'object' || Array.isArray(result)) {
      this.addError(prefix, 'result must be an object', result);
      return;
    }

    // Required string fields
    const requiredStrings = {
      'component': result.component,
      'file': result.file,
      'file_hash': result.file_hash,
      'file_url': result.file_url,
      'id': result.id,
      'latest': result.latest,
      'lines': result.lines,
      'matched': result.matched,
      'oss_lines': result.oss_lines,
      'release_date': result.release_date,
      'source_hash': result.source_hash,
      'status': result.status,
      'url': result.url,
      'url_hash': result.url_hash,
      'vendor': result.vendor,
      'version': result.version,
    };

    for (const [field, value] of Object.entries(requiredStrings)) {
      if (!value || typeof value !== 'string') {
        this.addError(`${prefix}`, `required '${field}' field must be provided`, value);
      }
    }

    // Required array fields (can be empty but must exist and be arrays)
    const requiredArrays = {
      'licenses': result.licenses,
      'purl': result.purl,
    };

    for (const [field, value] of Object.entries(requiredArrays)) {
      if (!Array.isArray(value)) {
        this.addError(`${prefix}.${field}`, 'required field must be an array', value);
      }
    }

  }

  // Add validation error
  private addError(field, message, value) {
    this.errors.push(new ValidationError(field, message, value));
  }

  // Get validation result
  private getValidationResult(): ValidationResult {
    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      errorCount: this.errors.length,
      getDetailedErrors: () => this.errors.map(err => ({
        field: err.cause,
        message: err.message,
        value: err.value,
      }))
    };
  }

  // Public method to get current errors
  getErrors(): ValidationError[] {
    return this.errors;
  }

  // Public method to check if valid
  hasErrors(): boolean {
    return this.errors.length > 0;
  }

}

