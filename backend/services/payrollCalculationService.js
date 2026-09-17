const roundMoney = (value) => {
  return Number(Number(value).toFixed(2));
};

const sumValues = (object) => {
  return Object.values(object).reduce(
    (total, value) =>
      total + Number(value || 0),
    0
  );
};

export const calculatePayroll = ({
  salary,
  overtimeHours = 0,
  bonus = 0,
  absenceDeduction = 0,
  unpaidLeaveDeduction = 0,
  otherDeduction,
}) => {
  const allowances = {
    housing:
      salary.allowances?.housing || 0,

    medical:
      salary.allowances?.medical || 0,

    transport:
      salary.allowances?.transport || 0,

    other:
      salary.allowances?.other || 0,
  };

  const overtimeAmount =
    Number(overtimeHours) *
    Number(
      salary.overtimeHourlyRate || 0
    );

  const deductions = {
    tax:
      salary.deductions?.tax || 0,

    providentFund:
      salary.deductions
        ?.providentFund || 0,

    loan:
      salary.deductions?.loan || 0,

    absence:
      Number(absenceDeduction || 0),

    unpaidLeave:
      Number(
        unpaidLeaveDeduction || 0
      ),

    other:
      otherDeduction !== undefined
        ? Number(otherDeduction)
        : Number(
            salary.deductions?.other || 0
          ),
  };

  const grossSalary =
    Number(salary.basicSalary) +
    sumValues(allowances) +
    overtimeAmount +
    Number(bonus || 0);

  const totalDeductions =
    sumValues(deductions);

  const netSalary =
    grossSalary - totalDeductions;

  if (netSalary < 0) {
    throw new Error(
      "Payroll deductions cannot exceed gross salary"
    );
  }

  return {
    allowances,

    overtimeAmount:
      roundMoney(overtimeAmount),

    deductions,

    grossSalary:
      roundMoney(grossSalary),

    totalDeductions:
      roundMoney(totalDeductions),

    netSalary:
      roundMoney(netSalary),
  };
};

export const calculateDailySalary = (
  basicSalary,
  workingDays
) => {
  if (!workingDays) {
    return 0;
  }

  return roundMoney(
    Number(basicSalary) /
      Number(workingDays)
  );
};