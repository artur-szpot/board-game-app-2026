Introduce named errors for various cases across the backend

Improve errors returned from the app outwards

Use ErrorBoundary

Medium: API docs for Bad Request shape are inconsistent with business-rule error messages.
Evidence: Controllers annotate Bad Request with ValidationErrorResponseDto (example: tag.controller.ts:33), while ValidationErrorResponseDto defines message as string array (error-response.dto.ts:22).
Tag/location cycle errors are thrown as single-string BadRequestException messages (tag.service.ts:89, location.service.ts:108).
Impact: Clients relying on schema may not parse these errors correctly.
