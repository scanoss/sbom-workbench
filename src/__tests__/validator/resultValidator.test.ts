import { ScanossResultValidator } from '../../main/modules/validator/ScanossResultValidator';

jest.mock('electron', () => ({
  app: {
    getPath: jest.fn(() => '/mock/path'),
    getName: jest.fn(() => 'MockAppName'),
    getVersion: jest.fn(() => '1.0.0'),
    // Add any other app methods you're using in your code
  },
  ipcMain: {
    on: jest.fn(),
    send: jest.fn(),
  },
  // Add any other Electron modules you're using
}));

// If you're using electron-log, you might want to mock it as well
jest.mock('electron-log', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  // Add any other methods from electron-log that you're using
}));

describe('result validator', () => {
  it('valid result premium', async () => {
    const result = {
      "backend/app.js": [
        {
          "component": "ecommerce-store",
          "copyrights": [],
          "cryptography": [],
          "dependencies": [],
          "file": "backend/app.js",
          "file_hash": "39b0d5191c20e23c8360a79a97ecec31",
          "file_url": "https://api.scanoss.com/file_contents/39b0d5191c20e23c8360a79a97ecec31",
          "health": {
            "creation_date": "2020-06-06",
            "forks": 200,
            "issues": 3,
            "last_push": "2024-03-27",
            "last_update": "2025-06-13",
            "stars": 102
          },
          "id": "file",
          "latest": "a8dcdb2",
          "licenses": [],
          "lines": "all",
          "matched": "100%",
          "oss_lines": "all",
          "provenance": "India",
          "purl": [
            "pkg:github/hacetheworld/ecommerce-store"
          ],
          "quality": [
            {
              "score": "4/5",
              "source": "best_practices"
            }
          ],
          "release_date": "2020-06-16",
          "server": {
            "elapsed": "0.004347s",
            "flags": "0",
            "hostname": "p16",
            "kb_version": {
              "daily": "25.07.16",
              "monthly": "25.06"
            },
            "version": "5.4.12"
          },
          "source_hash": "39b0d5191c20e23c8360a79a97ecec31",
          "status": "pending",
          "url": "https://github.com/hacetheworld/ecommerce-store",
          "url_hash": "7014da5fa24bdad7948a7eaa1e88dd72",
          "url_stats": {},
          "vendor": "hacetheworld",
          "version": "a8dcdb2",
          "vulnerabilities": []
        }
      ]};

    const resultValidator = new ScanossResultValidator();
    const r = resultValidator.validate(result);
    expect(r.isValid).toEqual(true);
  });

  it('invalid result, , missing purl key', async () => {
    const result = {
      "backend/app.js": [
        {
          "component": "ecommerce-store",
          "copyrights": [],
          "cryptography": [],
          "dependencies": [],
          "file": "backend/app.js",
          "file_hash": "39b0d5191c20e23c8360a79a97ecec31",
          "file_url": "https://api.scanoss.com/file_contents/39b0d5191c20e23c8360a79a97ecec31",
          "health": {
            "creation_date": "2020-06-06",
            "forks": 200,
            "issues": 3,
            "last_push": "2024-03-27",
            "last_update": "2025-06-13",
            "stars": 102
          },
          "id": "file",
          "latest": "a8dcdb2",
          "licenses": [],
          "lines": "all",
          "matched": "100%",
          "oss_lines": "all",
          "provenance": "India",
          "quality": [
            {
              "score": "4/5",
              "source": "best_practices"
            }
          ],
          "release_date": "2020-06-16",
          "server": {
            "elapsed": "0.004347s",
            "flags": "0",
            "hostname": "p16",
            "kb_version": {
              "daily": "25.07.16",
              "monthly": "25.06"
            },
            "version": "5.4.12"
          },
          "source_hash": "39b0d5191c20e23c8360a79a97ecec31",
          "status": "pending",
          "url": "https://github.com/hacetheworld/ecommerce-store",
          "url_hash": "7014da5fa24bdad7948a7eaa1e88dd72",
          "url_stats": {},
          "vendor": "hacetheworld",
          "version": "a8dcdb2",
          "vulnerabilities": []
        }
      ]
    };
    const resultValidator = new ScanossResultValidator();
    const r = resultValidator.validate(result);
    expect(r.isValid).toEqual(false);
  });

  it("invalid result, missing 'version' key", async () => {
    const result = {
      "backend/app.js": [
        {
          "component": "ecommerce-store",
          "copyrights": [],
          "cryptography": [],
          "dependencies": [],
          "file": "backend/app.js",
          "file_hash": "39b0d5191c20e23c8360a79a97ecec31",
          "file_url": "https://api.scanoss.com/file_contents/39b0d5191c20e23c8360a79a97ecec31",
          "health": {
            "creation_date": "2020-06-06",
            "forks": 200,
            "issues": 3,
            "last_push": "2024-03-27",
            "last_update": "2025-06-13",
            "stars": 102
          },
          "id": "file",
          "latest": "a8dcdb2",
          "licenses": [],
          "lines": "all",
          "matched": "100%",
          "oss_lines": "all",
          "provenance": "India",
          "purl": [
            "pkg:github/hacetheworld/ecommerce-store"
          ],
          "quality": [
            {
              "score": "4/5",
              "source": "best_practices"
            }
          ],
          "release_date": "2020-06-16",
          "server": {
            "elapsed": "0.004347s",
            "flags": "0",
            "hostname": "p16",
            "kb_version": {
              "daily": "25.07.16",
              "monthly": "25.06"
            },
            "version": "5.4.12"
          },
          "source_hash": "39b0d5191c20e23c8360a79a97ecec31",
          "status": "pending",
          "url": "https://github.com/hacetheworld/ecommerce-store",
          "url_hash": "7014da5fa24bdad7948a7eaa1e88dd72",
          "url_stats": {},
          "vendor": "hacetheworld",
          "vulnerabilities": []
        }
      ]};

    const resultValidator = new ScanossResultValidator();
    const r = resultValidator.validate(result);
    expect(r.isValid).toEqual(false);
  });

  it("invalid results, missing 'version' key", async () => {
    const result = {
      "backend/app.js": [
        {
          "component": "ecommerce-store",
          "copyrights": [],
          "cryptography": [],
          "dependencies": [],
          "file": "backend/app.js",
          "file_hash": "39b0d5191c20e23c8360a79a97ecec31",
          "file_url": "https://api.scanoss.com/file_contents/39b0d5191c20e23c8360a79a97ecec31",
          "health": {
            "creation_date": "2020-06-06",
            "forks": 200,
            "issues": 3,
            "last_push": "2024-03-27",
            "last_update": "2025-06-13",
            "stars": 102
          },
          "id": "file",
          "latest": "a8dcdb2",
          "licenses": [],
          "lines": "all",
          "matched": "100%",
          "oss_lines": "all",
          "provenance": "India",
          "purl": [
            "pkg:github/hacetheworld/ecommerce-store"
          ],
          "quality": [
            {
              "score": "4/5",
              "source": "best_practices"
            }
          ],
          "release_date": "2020-06-16",
          "server": {
            "elapsed": "0.004347s",
            "flags": "0",
            "hostname": "p16",
            "kb_version": {
              "daily": "25.07.16",
              "monthly": "25.06"
            },
            "version": "5.4.12"
          },
          "source_hash": "39b0d5191c20e23c8360a79a97ecec31",
          "status": "pending",
          "url": "https://github.com/hacetheworld/ecommerce-store",
          "url_hash": "7014da5fa24bdad7948a7eaa1e88dd72",
          "url_stats": {},
          "vendor": "hacetheworld",
          "vulnerabilities": []
        }
      ],
      "backend/app-2.js": [
        {
          "component": "ecommerce-store",
          "copyrights": [],
          "cryptography": [],
          "dependencies": [],
          "file": "backend/app.js",
          "file_hash": "39b0d5191c20e23c8360a79a97ecec31",
          "file_url": "https://api.scanoss.com/file_contents/39b0d5191c20e23c8360a79a97ecec31",
          "health": {
            "creation_date": "2020-06-06",
            "forks": 200,
            "issues": 3,
            "last_push": "2024-03-27",
            "last_update": "2025-06-13",
            "stars": 102
          },
          "id": "file",
          "latest": "a8dcdb2",
          "licenses": [],
          "lines": "all",
          "matched": "100%",
          "oss_lines": "all",
          "provenance": "India",
          "purl": [
            "pkg:github/hacetheworld/ecommerce-store"
          ],
          "quality": [
            {
              "score": "4/5",
              "source": "best_practices"
            }
          ],
          "release_date": "2020-06-16",
          "server": {
            "elapsed": "0.004347s",
            "flags": "0",
            "hostname": "p16",
            "kb_version": {
              "daily": "25.07.16",
              "monthly": "25.06"
            },
            "version": "5.4.12"
          },
          "source_hash": "39b0d5191c20e23c8360a79a97ecec31",
          "status": "pending",
          "url": "https://github.com/hacetheworld/ecommerce-store",
          "url_hash": "7014da5fa24bdad7948a7eaa1e88dd72",
          "url_stats": {},
          "vendor": "hacetheworld",
          "version": "a8dcdb2",
          "vulnerabilities": []
        }
      ]
    };
    const resultValidator = new ScanossResultValidator();
    const r = resultValidator.validate(result);
    expect(r.isValid).toEqual(false);
  });

  it("invalid dependency result, missing 'dependencies' key", async () => {
    const result =  {
      "backend/package.json": [
        {
          "dependency": [
            {
              "component": "@hapi/joi",
              "licenses": [
                {
                  "is_spdx_approved": true,
                  "name": "BSD-3-Clause",
                  "spdx_id": "BSD-3-Clause"
                }
              ],
              "purl": "pkg:npm/%40hapi/joi",
              "url": "https://www.npmjs.com/package/%40hapi/joi",
              "version": "17.1.1"
            },
            {
              "component": "bcryptjs",
              "licenses": [
                {
                  "is_spdx_approved": true,
                  "name": "MIT",
                  "spdx_id": "MIT"
                }
              ],
              "purl": "pkg:npm/bcryptjs",
              "url": "https://www.npmjs.com/package/bcryptjs",
              "version": "2.4.3"
            },
            {
              "component": "dotenv",
              "licenses": [
                {
                  "is_spdx_approved": true,
                  "name": "BSD-2-Clause",
                  "spdx_id": "BSD-2-Clause"
                }
              ],
              "purl": "pkg:npm/dotenv",
              "url": "https://www.npmjs.com/package/dotenv",
              "version": "8.6.0"
            },
            {
              "component": "express",
              "licenses": [
                {
                  "is_spdx_approved": true,
                  "name": "MIT",
                  "spdx_id": "MIT"
                }
              ],
              "purl": "pkg:npm/express",
              "url": "https://www.npmjs.com/package/express",
              "version": "4.21.2"
            },
            {
              "component": "jsonwebtoken",
              "licenses": [
                {
                  "is_spdx_approved": true,
                  "name": "MIT",
                  "spdx_id": "MIT"
                }
              ],
              "purl": "pkg:npm/jsonwebtoken",
              "url": "https://www.npmjs.com/package/jsonwebtoken",
              "version": "8.5.1"
            },
            {
              "component": "mongoose",
              "licenses": [
                {
                  "is_spdx_approved": true,
                  "name": "MIT",
                  "spdx_id": "MIT"
                }
              ],
              "purl": "pkg:npm/mongoose",
              "url": "https://www.npmjs.com/package/mongoose",
              "version": "5.13.23"
            },
            {
              "component": "nodemon",
              "licenses": [
                {
                  "is_spdx_approved": true,
                  "name": "MIT",
                  "spdx_id": "MIT"
                }
              ],
              "purl": "pkg:npm/nodemon",
              "url": "https://www.npmjs.com/package/nodemon",
              "version": "2.0.22"
            }
          ],
          "id": "dependency",
          "status": "pending"
        }
      ]};
    const resultValidator = new ScanossResultValidator();
    const r = resultValidator.validate(result);
    console.log(r.getDetailedErrors());
    expect(r.isValid).toEqual(false);
  });

  it("valid dependency result", async () => {
    const result =  {
      "backend/package.json": [
        {
          "dependencies": [
            {
              "component": "@hapi/joi",
              "licenses": [
                {
                  "is_spdx_approved": true,
                  "name": "BSD-3-Clause",
                  "spdx_id": "BSD-3-Clause"
                }
              ],
              "purl": "pkg:npm/%40hapi/joi",
              "url": "https://www.npmjs.com/package/%40hapi/joi",
              "version": "17.1.1"
            },
            {
              "component": "bcryptjs",
              "licenses": [
                {
                  "is_spdx_approved": true,
                  "name": "MIT",
                  "spdx_id": "MIT"
                }
              ],
              "purl": "pkg:npm/bcryptjs",
              "url": "https://www.npmjs.com/package/bcryptjs",
              "version": "2.4.3"
            },
            {
              "component": "dotenv",
              "licenses": [
                {
                  "is_spdx_approved": true,
                  "name": "BSD-2-Clause",
                  "spdx_id": "BSD-2-Clause"
                }
              ],
              "purl": "pkg:npm/dotenv",
              "url": "https://www.npmjs.com/package/dotenv",
              "version": "8.6.0"
            },
            {
              "component": "express",
              "licenses": [
                {
                  "is_spdx_approved": true,
                  "name": "MIT",
                  "spdx_id": "MIT"
                }
              ],
              "purl": "pkg:npm/express",
              "url": "https://www.npmjs.com/package/express",
              "version": "4.21.2"
            },
            {
              "component": "jsonwebtoken",
              "licenses": [
                {
                  "is_spdx_approved": true,
                  "name": "MIT",
                  "spdx_id": "MIT"
                }
              ],
              "purl": "pkg:npm/jsonwebtoken",
              "url": "https://www.npmjs.com/package/jsonwebtoken",
              "version": "8.5.1"
            },
            {
              "component": "mongoose",
              "licenses": [
                {
                  "is_spdx_approved": true,
                  "name": "MIT",
                  "spdx_id": "MIT"
                }
              ],
              "purl": "pkg:npm/mongoose",
              "url": "https://www.npmjs.com/package/mongoose",
              "version": "5.13.23"
            },
            {
              "component": "nodemon",
              "licenses": [
                {
                  "is_spdx_approved": true,
                  "name": "MIT",
                  "spdx_id": "MIT"
                }
              ],
              "purl": "pkg:npm/nodemon",
              "url": "https://www.npmjs.com/package/nodemon",
              "version": "2.0.22"
            }
          ],
          "id": "dependency",
          "status": "pending"
        }
      ]};
    const resultValidator = new ScanossResultValidator();
    const r = resultValidator.validate(result);
    expect(r.isValid).toEqual(true);
  });


  it('valid result free', async () => {
    const result = {
      "backend/app.js": [
        {
          "component": "ecommerce-store",
          "file": "backend/app.js",
          "file_hash": "39b0d5191c20e23c8360a79a97ecec31",
          "file_url": "https://api.scanoss.com/file_contents/39b0d5191c20e23c8360a79a97ecec31",
          "health": {
            "creation_date": "2020-06-06",
            "forks": 200,
            "issues": 3,
            "last_push": "2024-03-27",
            "last_update": "2025-06-13",
            "stars": 102
          },
          "id": "file",
          "latest": "a8dcdb2",
          "licenses": [],
          "lines": "all",
          "matched": "100%",
          "oss_lines": "all",
          "provenance": "India",
          "purl": [
            "pkg:github/hacetheworld/ecommerce-store"
          ],
          "release_date": "2020-06-16",
          "server": {
            "kb_version": {
              "daily": "25.07.16",
              "monthly": "25.06"
            },
            "version": "5.4.12"
          },
          "source_hash": "39b0d5191c20e23c8360a79a97ecec31",
          "status": "pending",
          "url": "https://github.com/hacetheworld/ecommerce-store",
          "url_hash": "7014da5fa24bdad7948a7eaa1e88dd72",
          "vendor": "hacetheworld",
          "version": "a8dcdb2"
        }
      ]};

    const resultValidator = new ScanossResultValidator();
    const r = resultValidator.validate(result);
    expect(r.isValid).toEqual(true);
  });


});
