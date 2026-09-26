import {
  validateDocumentFile,
} from "../services/documentFileSecurityService.js";

const validateDocumentFileMiddleware =
  (
    req,
    res,
    next
  ) => {
    try {
      validateDocumentFile(
        req.file
      );

      next();
    } catch (error) {
      next(error);
    }
  };

export default
  validateDocumentFileMiddleware;