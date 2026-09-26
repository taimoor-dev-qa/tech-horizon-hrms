const roundMoney = (
  value
) => {
  return Number(
    Number(value)
      .toFixed(2)
  );
};

const sumValues = (
  object
) => {
  return Object
    .values(object)
    .reduce(
      (
        total,
        value
      ) =>
        total +
        Number(
          value || 0
        ),
      0
    );
};

const normalizeFactor = (
  value
) => {
  const factor =
    Number(value);

  if (
    Number.isNaN(factor)
  ) {
    return 1;
  }

  return Math.min(
    1,
    Math.max(
      0,
      factor
    )
  );
};

const prorate = (
  value,
  factor
) => {
  return roundMoney(
    Number(
      value || 0
    ) * factor
  );
};

export const calculatePayroll =
  ({
    salary,

    prorationFactor = 1,

    overtimeHours = 0,

    bonus = 0,

    absenceDeduction = 0,

    unpaidLeaveDeduction = 0,

    otherDeduction,
  }) => {
    const factor =
      normalizeFactor(
        prorationFactor
      );

    const basicSalary =
      prorate(
        salary.basicSalary,
        factor
      );

    const allowances = {
      housing:
        prorate(
          salary.allowances
            ?.housing,
          factor
        ),

      medical:
        prorate(
          salary.allowances
            ?.medical,
          factor
        ),

      transport:
        prorate(
          salary.allowances
            ?.transport,
          factor
        ),

      other:
        prorate(
          salary.allowances
            ?.other,
          factor
        ),
    };

    const overtimeAmount =
      Number(
        overtimeHours
      ) *
      Number(
        salary
          .overtimeHourlyRate ||
          0
      );

    /*
     * Existing salary-structure
     * deductions preserve kar rahe
     * hain.
     *
     * Sirf salary + allowances
     * prorate ho rahe hain.
     */
    const deductions = {
      tax:
        salary.deductions
          ?.tax || 0,

      providentFund:
        salary.deductions
          ?.providentFund ||
        0,

      loan:
        salary.deductions
          ?.loan || 0,

      absence:
        Number(
          absenceDeduction ||
          0
        ),

      unpaidLeave:
        Number(
          unpaidLeaveDeduction ||
          0
        ),

      other:
        otherDeduction !==
        undefined
          ? Number(
              otherDeduction
            )
          : Number(
              salary.deductions
                ?.other || 0
            ),
    };

    const grossSalary =
      basicSalary +
      sumValues(
        allowances
      ) +
      overtimeAmount +
      Number(
        bonus || 0
      );

    const totalDeductions =
      sumValues(
        deductions
      );

    const netSalary =
      grossSalary -
      totalDeductions;

    if (
      netSalary < 0
    ) {
      throw new Error(
        "Payroll deductions cannot exceed gross salary"
      );
    }

    return {
      basicSalary,

      allowances,

      overtimeAmount:
        roundMoney(
          overtimeAmount
        ),

      deductions,

      grossSalary:
        roundMoney(
          grossSalary
        ),

      totalDeductions:
        roundMoney(
          totalDeductions
        ),

      netSalary:
        roundMoney(
          netSalary
        ),
    };
  };

export const calculateDailySalary =
  (
    basicSalary,
    workingDays
  ) => {
    if (!workingDays) {
      return 0;
    }

    return roundMoney(
      Number(
        basicSalary
      ) /
        Number(
          workingDays
        )
    );
  };