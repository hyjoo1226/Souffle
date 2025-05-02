# app/logic/equation_checker.py
from sympy import sympify, simplify
import re
from typing import TypedDict, Optional

class StepCheckResult(TypedDict):
    is_valid: bool
    error: Optional[str]
    prev_clean: str
    curr_clean: str

def clean_expression(expr: str) -> str:
    """
    수식 문자열 정규화:
    - $ 제거
    - LaTeX ^{} → ** 로 변환
    - ^ → ** (fallback)
    - 2x → 2*x 암묵적 곱셈 명시
    - 공백 제거
    """
    expr = expr.strip().strip("$")
    expr = re.sub(r"([a-zA-Z0-9])\^\{([0-9]+)\}", r"\1**\2", expr)
    expr = expr.replace("^", "**")
    expr = expr.replace(" ", "")
    # 숫자 바로 뒤에 변수가 오는 경우 명시적 곱셈으로 변환 (예: 2x → 2*x)
    expr = re.sub(r"(?<=\d)(?=[a-zA-Z])", "*", expr)
    return expr

def analyze_step_change(prev_expr: str, curr_expr: str) -> StepCheckResult:
    """
    두 수식 간의 수학적 동치 여부 판단
    등식이면 좌우항 비교, 단항식이면 전체 표현식 비교
    정제된 수식도 함께 반환하여 downstream에서 GPT 피드백 생성을 위한 기반으로 활용 가능
    """
    try:
        prev_expr_clean = clean_expression(prev_expr)
        curr_expr_clean = clean_expression(curr_expr)

        def compare_equations(a: str, b: str) -> bool:
            if "=" in a and "=" in b:
                lhs1, rhs1 = map(sympify, a.split("="))
                lhs2, rhs2 = map(sympify, b.split("="))
                return simplify(lhs1 - rhs1) == simplify(lhs2 - rhs2)
            else:
                return simplify(sympify(a) - sympify(b)) == 0

        print(f"[EquationChecker] 비교 시도: '{prev_expr_clean}' vs '{curr_expr_clean}'")
        is_valid = compare_equations(prev_expr_clean, curr_expr_clean)

        # 이 정제된 수식들은 downstream의 GPT 피드백 생성 단계에서 그대로 사용됩니다.
        return StepCheckResult(
            is_valid=is_valid,
            error=None,
            prev_clean=prev_expr_clean,
            curr_clean=curr_expr_clean
        )

    except Exception as e:
        if 'sympify' in str(e).lower():
            print(f"[EquationChecker] 수식 파싱 실패 (SymPy): {e}")
        else:
            print(f"[EquationChecker] 수식 비교 중 오류: {e}")

        return StepCheckResult(
            is_valid=False,
            error=str(e),
            prev_clean=prev_expr,
            curr_clean=curr_expr
        )
