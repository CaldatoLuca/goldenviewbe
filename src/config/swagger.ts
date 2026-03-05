import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "GoldenView API",
      version: "1.0.0",
      description:
        "REST API for GoldenView — manages authentication, users, spots and file uploads.",
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "accessToken",
          description:
            "HttpOnly cookie set automatically on login/register. Expired tokens are refreshed transparently via the refreshToken cookie.",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "clxyz123" },
            username: { type: "string", example: "johndoe" },
            email: { type: "string", format: "email", example: "john@example.com" },
            image: { type: "string", nullable: true, example: "https://cdn.example.com/avatar.png" },
            role: { type: "string", enum: ["USER", "ADMIN"], example: "USER" },
            emailVerified: { type: "boolean", example: false },
          },
        },
        Spot: {
          type: "object",
          properties: {
            id: { type: "string", example: "clspot456" },
            name: { type: "string", example: "Golden Beach" },
            address: { type: "string", example: "Via del Mare 1" },
            place: { type: "string", example: "Sardegna" },
            description: { type: "string", example: "A beautiful golden beach" },
            userId: { type: "string", example: "clxyz123" },
            images: {
              type: "array",
              items: { type: "string" },
              example: ["https://cdn.example.com/img1.jpg"],
            },
            latitude: { type: "number", example: 39.2238 },
            longitude: { type: "number", example: 9.1217 },
            public: { type: "boolean", example: true },
            active: { type: "boolean", example: true },
            slug: { type: "string", example: "golden-beach" },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                message: { type: "string", example: "Error description" },
                status: { type: "integer", example: 400 },
              },
            },
          },
        },
        ValidationErrorResponse: {
          type: "object",
          properties: {
            issues: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  code: { type: "string", example: "invalid_string" },
                  message: { type: "string", example: "Email not correct" },
                  path: {
                    type: "array",
                    items: { type: "string" },
                    example: ["body", "email"],
                  },
                },
              },
            },
          },
        },
      },
    },
    paths: {
      "/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password", "username"],
                  properties: {
                    email: { type: "string", format: "email", example: "john@example.com" },
                    password: { type: "string", minLength: 8, example: "secret123" },
                    username: { type: "string", minLength: 3, maxLength: 30, example: "johndoe" },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "User registered successfully. Sets accessToken and refreshToken HttpOnly cookies.",
              content: {
                "application/json": {
                  schema: {
                    allOf: [
                      { $ref: "#/components/schemas/SuccessResponse" },
                      {
                        type: "object",
                        properties: {
                          user: { $ref: "#/components/schemas/User" },
                          accessToken: { type: "string" },
                        },
                      },
                    ],
                  },
                },
              },
            },
            "400": {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ValidationErrorResponse" },
                },
              },
            },
            "409": {
              description: "Email already registered",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login with email and password",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email", example: "john@example.com" },
                    password: { type: "string", minLength: 1, example: "secret123" },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Login successful. Sets accessToken and refreshToken HttpOnly cookies.",
              content: {
                "application/json": {
                  schema: {
                    allOf: [
                      { $ref: "#/components/schemas/SuccessResponse" },
                      {
                        type: "object",
                        properties: {
                          user: { $ref: "#/components/schemas/User" },
                          accessToken: { type: "string" },
                        },
                      },
                    ],
                  },
                },
              },
            },
            "400": {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ValidationErrorResponse" },
                },
              },
            },
            "401": {
              description: "Invalid credentials",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/auth/refresh": {
        post: {
          tags: ["Auth"],
          summary: "Refresh the access token",
          description:
            "Uses the refreshToken cookie to issue a new accessToken. Implements token rotation — the old refresh token is invalidated and a new one is set.",
          responses: {
            "200": {
              description: "Tokens refreshed. New cookies are set.",
              content: {
                "application/json": {
                  schema: {
                    allOf: [
                      { $ref: "#/components/schemas/SuccessResponse" },
                      {
                        type: "object",
                        properties: {
                          accessToken: { type: "string" },
                        },
                      },
                    ],
                  },
                },
              },
            },
            "401": {
              description: "Missing, invalid, or reused refresh token",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Logout the current user",
          description:
            "Clears the refreshToken from the database and removes both auth cookies.",
          responses: {
            "200": {
              description: "Logged out successfully",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/SuccessResponse" },
                },
              },
            },
          },
        },
      },
      "/users/me": {
        get: {
          tags: ["Users"],
          summary: "Get the current authenticated user",
          security: [{ cookieAuth: [] }],
          responses: {
            "200": {
              description: "Current user profile",
              content: {
                "application/json": {
                  schema: {
                    allOf: [
                      { $ref: "#/components/schemas/SuccessResponse" },
                      {
                        type: "object",
                        properties: {
                          user: { $ref: "#/components/schemas/User" },
                        },
                      },
                    ],
                  },
                },
              },
            },
            "401": {
              description: "Not authenticated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "404": {
              description: "User not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/spots/get-all": {
        get: {
          tags: ["Spots"],
          summary: "Get all spots",
          responses: {
            "200": {
              description: "List of all spots",
              content: {
                "application/json": {
                  schema: {
                    allOf: [
                      { $ref: "#/components/schemas/SuccessResponse" },
                      {
                        type: "object",
                        properties: {
                          total: { type: "integer", example: 3 },
                          spots: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Spot" },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            "404": {
              description: "No spots found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/uploadthing": {
        post: {
          tags: ["Upload"],
          summary: "Upload an image file",
          security: [{ cookieAuth: [] }],
          description:
            "Handled by UploadThing. Accepts a single image up to 4 MB. Returns the uploaded file URL.",
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    file: {
                      type: "string",
                      format: "binary",
                      description: "Image file (max 4 MB)",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "File uploaded successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      url: { type: "string", example: "https://uploadthing.com/f/abc123.jpg" },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Not authenticated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
