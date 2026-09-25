import mongoose from "mongoose";

const isTransactionUnsupported = (
  error
) => {
  const message =
    error?.message || "";

  return (
    message.includes(
      "Transaction numbers are only allowed"
    ) ||
    message.includes(
      "replica set member or mongos"
    )
  );
};

const runTransaction = async (
  callback
) => {
  const session =
    await mongoose.startSession();

  let result;

  try {
    await session.withTransaction(
      async () => {
        result =
          await callback(session);
      }
    );

    return result;
  } catch (error) {
    if (
      isTransactionUnsupported(
        error
      )
    ) {
      throw new Error(
        "MongoDB transactions require a replica set. Enable replica set mode before using transactional operations."
      );
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

export default runTransaction;