"""
수식 검증 모듈 - 학생의 수학 풀이 단계를 검증합니다.
"""

import re
import logging
from typing import Dict, List, Tuple, Optional, Union, Any
from sympy import symbols, sympify, simplify, expand, Eq, solve, Symbol, poly, factor
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, implicit_multiplication_application
from sympy.core.relational import Equality
from sympy.logic.boolalg import Or

# 로깅 설정
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# 타입 정의
StepDict = Dict[str, Any]
ValidationResult = Tuple[bool, Optional[str]]


class LatexParser:
    """LaTeX 수식을 SymPy 형태로 파싱하는 유틸리티 클래스"""
    
    @staticmethod
    def clean_latex(latex: str) -> str:
        """LaTeX 문자열 정리"""
        # 등호 주변 공백 정규화
        latex = re.sub(r'\s*=\s*', '=', latex)
        
        # 멱승 표현 변환 (^를 **로)
        latex = re.sub(r'(\w+)\^(\d+)', r'\1**\2', latex)
        
        # LaTeX 표현을 SymPy 파서가 이해할 수 있는 형태로 변환
        latex = latex.replace("\\lor", " or ")
        
        # (a)(b) 형태를 (a)*(b) 형태로 변환
        latex = re.sub(r'\)\(', ')*(', latex)
        
        return latex
    
    @staticmethod
    def parse_expression(latex: str) -> Any:
        """LaTeX 표현식(등호 없는 형태)을 SymPy 표현식으로 변환"""
        try:
            # ^ 기호를 ** 로 변환
            latex = re.sub(r'(\w+)\^(\d+)', r'\1**\2', latex)
            
            # 공백 제거
            latex = latex.strip()
            
            # 괄호 곱셈 형태 처리
            latex = re.sub(r'\)\(', ')*(', latex)
            
            # 암시적 곱셈을 지원하는 변환 설정
            transformations = standard_transformations + (implicit_multiplication_application,)
            
            logger.debug(f"파싱할 표현식: {latex}")
            return parse_expr(latex, transformations=transformations)
        except Exception as e:
            logger.error(f"표현식 파싱 오류: {str(e)}, 입력: {latex}")
            raise ValueError(f"표현식 파싱 오류: {e}")

    @staticmethod
    def parse_to_sympy(latex: str) -> Any:
        """LaTeX 문자열을 SymPy 표현식으로 변환"""
        try:
            cleaned = LatexParser.clean_latex(latex)
            logger.debug(f"정제된 LaTeX: {cleaned}")
            
            # 방정식 형태인 경우 (등호 포함)
            if "=" in cleaned:
                lhs, rhs = cleaned.split("=")
                lhs_expr = LatexParser.parse_expression(lhs)
                rhs_expr = LatexParser.parse_expression(rhs)
                return Eq(lhs_expr, rhs_expr)
            else:
                # 일반 표현식 형태인 경우
                return LatexParser.parse_expression(cleaned)
        except Exception as e:
            logger.error(f"LaTeX 파싱 중 오류: {str(e)}, 입력: {latex}")
            raise ValueError(f"LaTeX 파싱 오류: {e}")

    @staticmethod
    def extract_equation_parts(latex: str) -> Tuple[str, str]:
        """방정식에서 좌변과 우변 추출"""
        if "=" not in latex:
            raise ValueError("방정식 형식이 아닙니다: 등호가 없음")

        parts = latex.split("=")
        if len(parts) != 2:
            raise ValueError("방정식 형식이 아닙니다: 등호가 여러 개임")

        return parts[0].strip(), parts[1].strip()

    @staticmethod
    def extract_factors(latex: str) -> List[str]:
        """인수분해 식에서 개별 인수 추출"""
        # (a)(b) = 0 또는 (a)*(b) = 0 형태 지원
        match = re.match(r"(.*)\((.*)\)(?:\*?)\((.*)\)\s*=\s*0", latex)
        if not match:
            logger.error(f"인수분해 형식 추출 실패: {latex}")
            raise ValueError("인수분해 형식이 아닙니다")

        return [match.group(2).strip(), match.group(3).strip()]

    @staticmethod
    def extract_or_equations(latex: str) -> List[str]:
        """논리합 형태의 수식에서 개별 방정식 추출"""
        if "\\lor" not in latex:
            raise ValueError("논리합 형식이 아닙니다")

        return [eq.strip() for eq in latex.split("\\lor")]


class StepValidator:
    """수식 단계 검증을 위한 기본 클래스"""

    def __init__(self):
        self.x = Symbol('x')

    def validate(self, prev_latex: str, curr_latex: str) -> ValidationResult:
        """수식 단계 검증 (오버라이드 대상)"""
        raise NotImplementedError("하위 클래스에서 구현해야 합니다")

    def are_expressions_equal(self, expr1, expr2) -> bool:
        """두 표현식이 수학적으로 동치인지 확인"""
        try:
            logger.debug(f"표현식 비교: {expr1} vs {expr2}")
            
            # 방법 1: equals 메서드 사용 (최신 SymPy)
            try:
                equals_result = expr1.equals(expr2)
                logger.debug(f"equals 결과: {equals_result}")
                
                # equals가 결정적인 결과를 제공하면 해당 결과 반환
                if equals_result is not None and equals_result:
                    return True
            except Exception as e:
                logger.debug(f"equals 메서드 실패: {e}")
            
            # 방법 2: expand 후 simplify로 비교
            try:
                expanded1 = expand(expr1)
                expanded2 = expand(expr2)
                expand_equal = simplify(expanded1 - expanded2) == 0
                logger.debug(f"expand 비교 결과: {expand_equal}")
                
                if expand_equal:
                    return True
            except Exception as e:
                logger.debug(f"expand 비교 실패: {e}")
                
            # 방법 3: factor 후 비교 (특히 인수분해 검증에 유용)
            try:
                factored1 = factor(expr1)
                factored2 = factor(expr2)
                factor_equal = factored1 == factored2
                logger.debug(f"factor 비교 결과: {factor_equal}")
                
                if factor_equal:
                    return True
            except Exception as e:
                logger.debug(f"factor 비교 실패: {e}")
                
            # 방법 4: 직접 문자열 비교 (마지막 대안)
            try:
                if str(expr1) == str(expr2):
                    return True
            except:
                pass
                
            # 모든 방법이 실패하면 False 반환
            return False
        except Exception as e:
            logger.error(f"표현식 비교 중 오류: {e}")
            # 오류 발생 시 False 반환
            return False


class GeneralStepValidator(StepValidator):
    """일반적인 수식 변환 검증"""

    def validate(self, prev_latex: str, curr_latex: str) -> ValidationResult:
        try:
            # LaTeX 수식을 SymPy 형태로 변환
            prev_expr = LatexParser.parse_to_sympy(prev_latex)
            curr_expr = LatexParser.parse_to_sympy(curr_latex)
            
            logger.debug(f"일반 검증 - 이전: {prev_expr}, 현재: {curr_expr}")

            # 두 식이 수학적으로 동치인지 확인
            if isinstance(prev_expr, Equality) and isinstance(curr_expr, Equality):
                # 방정식인 경우 양변 비교
                lhs_equal = self.are_expressions_equal(prev_expr.lhs, curr_expr.lhs)
                rhs_equal = self.are_expressions_equal(prev_expr.rhs, curr_expr.rhs)
                is_valid = lhs_equal and rhs_equal
            else:
                # 일반 수식인 경우 비교
                is_valid = self.are_expressions_equal(prev_expr, curr_expr)

            return is_valid, None if is_valid else "general_error"
        except Exception as e:
            logger.error(f"GeneralStepValidator 오류: {e}")
            return False, "general_error"


class FactorizationValidator(StepValidator):
    """인수분해 검증 (x^2 + 5x + 6 = 0 → (x+2)(x+3) = 0)"""

    def validate(self, prev_latex: str, curr_latex: str) -> ValidationResult:
        try:
            logger.debug(f"인수분해 검증 시작 - 이전: {prev_latex}, 현재: {curr_latex}")
            
            # 이차방정식에서 우변이 0인지 확인
            prev_lhs, prev_rhs = LatexParser.extract_equation_parts(prev_latex)
            if prev_rhs != "0":
                logger.debug("이전 식의 우변이 0이 아님")
                return False, "equation_format_error"

            # 인수분해 식에서 우변이 0인지 확인
            curr_lhs, curr_rhs = LatexParser.extract_equation_parts(curr_latex)
            if curr_rhs != "0":
                logger.debug("현재 식의 우변이 0이 아님")
                return False, "equation_format_error"
                
            # 간소화된 접근법: 양변의 표현식만 추출하여 비교
            try:
                # 직접적인 예제 코드와 비슷한 방식으로 검증
                # x^2 + 5*x + 6와 (x + 2)*(x + 3) 비교
                prev_expr = LatexParser.parse_expression(prev_lhs)
                
                # 인수 추출 및 곱셈 형태로 변환
                try:
                    factors = LatexParser.extract_factors(curr_latex)
                    factor1 = LatexParser.parse_expression(factors[0])
                    factor2 = LatexParser.parse_expression(factors[1])
                    curr_expr = factor1 * factor2
                    
                    # equals 메서드로 직접 비교
                    equals_result = prev_expr.equals(curr_expr)
                    logger.debug(f"인수분해 equals 결과: {equals_result}")
                    
                    if equals_result is not None:
                        return equals_result, None if equals_result else "factorization_error"
                        
                    # expand 후 비교
                    prev_expanded = expand(prev_expr)
                    curr_expanded = expand(curr_expr)
                    is_equal = simplify(prev_expanded - curr_expanded) == 0
                    logger.debug(f"인수분해 expand 비교 결과: {is_equal}")
                    
                    if is_equal:
                        return True, None
                except Exception as e:
                    logger.error(f"인수분해 인수 추출 오류: {e}")
            
            except Exception as e:
                logger.error(f"인수분해 표현식 비교 오류: {e}")
            
            # 해 비교 방식 시도 (마지막 방법)
            try:
                # 원래 식의 해 계산
                x = Symbol('x')
                original_eq = Eq(LatexParser.parse_expression(prev_lhs), 0)
                original_solutions = solve(original_eq, x)
                original_solutions_set = {str(sol) for sol in original_solutions}
                
                # 인수로부터 해 계산
                factors = LatexParser.extract_factors(curr_latex)
                factored_solutions = []
                
                for factor in factors:
                    factor_eq = Eq(LatexParser.parse_expression(factor), 0)
                    solutions = solve(factor_eq, x)
                    factored_solutions.extend(solutions)
                
                factored_solutions_set = {str(sol) for sol in factored_solutions}
                
                logger.debug(f"원래 식의 해: {original_solutions_set}")
                logger.debug(f"인수의 해: {factored_solutions_set}")
                
                # 해집합 비교
                is_equal = original_solutions_set == factored_solutions_set
                logger.debug(f"해 비교 결과: {is_equal}")
                
                return is_equal, None if is_equal else "factorization_error"
            except Exception as e:
                logger.error(f"인수분해 해 비교 오류: {e}")
            
            # 모든 방법 실패
            return False, "factorization_error"
            
        except Exception as e:
            logger.error(f"FactorizationValidator 전체 오류: {e}")
            return False, "factorization_error"


class ZeroProductRuleValidator(StepValidator):
    """영 곱셈 규칙 적용 검증 ((A)(B)=0 → A=0 ∨ B=0)"""

    def validate(self, prev_latex: str, curr_latex: str) -> ValidationResult:
        try:
            logger.debug(f"영 곱셈 규칙 검증 시작 - 이전: {prev_latex}, 현재: {curr_latex}")
            
            # 인수분해 형태 확인
            if not re.search(r"\(.*\)(?:\*?)\(.*\)\s*=\s*0", prev_latex):
                logger.debug("이전 식이 인수분해 형태가 아님")
                return False, "zero_product_rule_error"

            # 논리합 형태 확인
            if "\\lor" not in curr_latex:
                logger.debug("현재 식이 논리합 형태가 아님")
                return False, "zero_product_rule_error"

            # 인수 추출
            try:
                factors = LatexParser.extract_factors(prev_latex)
                logger.debug(f"추출된 인수들: {factors}")
                
                if len(factors) != 2:
                    logger.debug(f"인수가 2개가 아님: {len(factors)}")
                    return False, "zero_product_rule_error"
            except Exception as e:
                logger.error(f"인수 추출 오류: {e}")
                return False, "zero_product_rule_error"

            # 논리합 방정식 추출
            try:
                equations = LatexParser.extract_or_equations(curr_latex)
                logger.debug(f"추출된 방정식들: {equations}")
                
                if len(equations) != 2:
                    logger.debug(f"방정식이 2개가 아님: {len(equations)}")
                    return False, "zero_product_rule_error"
            except Exception as e:
                logger.error(f"방정식 추출 오류: {e}")
                return False, "zero_product_rule_error"

            # 각 방정식이 "인수 = 0" 형태인지 확인
            valid_equations = []
            for eq in equations:
                try:
                    lhs, rhs = LatexParser.extract_equation_parts(eq)
                    if rhs != "0":
                        logger.debug(f"방정식 우변이 0이 아님: {eq}")
                        return False, "zero_product_rule_error"
                    valid_equations.append(lhs)
                except Exception as e:
                    logger.error(f"방정식 형식 확인 오류: {e}")
                    return False, "zero_product_rule_error"

            # 인수와 방정식 좌변 비교 (순서 무관)
            try:
                # SymPy 표현식으로 변환하여 equals 비교
                factor_exprs = []
                equation_exprs = []
                
                for f in factors:
                    try:
                        factor_exprs.append(LatexParser.parse_expression(f))
                    except Exception as e:
                        logger.error(f"인수 파싱 오류: {e}, 인수: {f}")
                        return False, "zero_product_rule_error"
                
                for e in valid_equations:
                    try:
                        equation_exprs.append(LatexParser.parse_expression(e))
                    except Exception as e:
                        logger.error(f"방정식 파싱 오류: {e}, 방정식: {e}")
                        return False, "zero_product_rule_error"
                
                logger.debug(f"인수 표현식: {factor_exprs}")
                logger.debug(f"방정식 표현식: {equation_exprs}")
                
                # 모든 인수가 하나의 방정식과 일치하는지 확인
                matches = 0
                for factor_expr in factor_exprs:
                    for eq_expr in equation_exprs:
                        try:
                            if self.are_expressions_equal(factor_expr, eq_expr):
                                matches += 1
                                break
                        except Exception as e:
                            logger.error(f"표현식 비교 오류: {e}")
                
                logger.debug(f"일치하는 표현식 수: {matches}/{len(factors)}")
                is_valid = matches == len(factors)
                
                return is_valid, None if is_valid else "zero_product_rule_error"
            except Exception as e:
                logger.error(f"인수-방정식 비교 오류: {e}")
                return False, "zero_product_rule_error"
        except Exception as e:
            logger.error(f"ZeroProductRuleValidator 전체 오류: {e}")
            return False, "zero_product_rule_error"


class SolutionCalculationValidator(StepValidator):
    """해 계산 단계 검증 (x+a=0 ∨ x+b=0 → x=-a ∨ x=-b)"""

    def validate(self, prev_latex: str, curr_latex: str) -> ValidationResult:
        try:
            logger.debug(f"해 계산 검증 시작 - 이전: {prev_latex}, 현재: {curr_latex}")
            
            # 논리합 형태 확인
            if "\\lor" not in prev_latex or "\\lor" not in curr_latex:
                logger.debug("이전 또는 현재 식이 논리합 형태가 아님")
                return False, "solution_calculation_error"

            # 이전 단계의 방정식들 추출
            try:
                prev_equations = LatexParser.extract_or_equations(prev_latex)
                logger.debug(f"이전 방정식들: {prev_equations}")
            except Exception as e:
                logger.error(f"이전 방정식 추출 오류: {e}")
                return False, "solution_calculation_error"

            # 현재 단계의 해들 추출
            try:
                curr_solutions = LatexParser.extract_or_equations(curr_latex)
                logger.debug(f"현재 해들: {curr_solutions}")
            except Exception as e:
                logger.error(f"현재 해 추출 오류: {e}")
                return False, "solution_calculation_error"

            if len(prev_equations) != len(curr_solutions):
                logger.debug(f"방정식 수와 해 수가 다름: {len(prev_equations)} vs {len(curr_solutions)}")
                return False, "solution_calculation_error"

            # 각 방정식에서 계산된 해와 제공된 해 비교
            solved_values = []
            for eq in prev_equations:
                try:
                    lhs, rhs = LatexParser.extract_equation_parts(eq)
                    if rhs != "0":
                        logger.debug(f"방정식 우변이 0이 아님: {eq}")
                        return False, "solution_calculation_error"
                    
                    # 일차방정식 해결 (x+a=0 → x=-a)
                    x = Symbol('x')
                    lhs_expr = LatexParser.parse_expression(lhs)
                    eq_sympy = Eq(lhs_expr, 0)
                    solved = solve(eq_sympy, x)
                    if solved:
                        solved_values.extend(solved)
                        logger.debug(f"방정식 {eq}의 해: {solved}")
                except Exception as e:
                    logger.error(f"방정식 해결 오류: {e}, 방정식: {eq}")
                    return False, "solution_calculation_error"

            # 제공된 해 추출
            provided_values = []
            for sol in curr_solutions:
                try:
                    lhs, rhs = LatexParser.extract_equation_parts(sol)
                    if lhs != "x":
                        logger.debug(f"해 좌변이 x가 아님: {sol}")
                        return False, "solution_calculation_error"
                    
                    provided_values.append(LatexParser.parse_expression(rhs))
                    logger.debug(f"제공된 해: {rhs}")
                except Exception as e:
                    logger.error(f"해 추출 오류: {e}, 해: {sol}")
                    return False, "solution_calculation_error"

            # 모든 해가 일치하는지 확인 (순서 무관)
            try:
                matches = 0
                for solved_val in solved_values:
                    for provided_val in provided_values:
                        if self.are_expressions_equal(solved_val, provided_val):
                            matches += 1
                            break
                
                logger.debug(f"일치하는 해 수: {matches}/{len(solved_values)}")
                is_valid = matches == len(solved_values)
                
                return is_valid, None if is_valid else "solution_calculation_error"
            except Exception as e:
                logger.error(f"해 비교 오류: {e}")
                return False, "solution_calculation_error"
        except Exception as e:
            logger.error(f"SolutionCalculationValidator 전체 오류: {e}")
            return False, "solution_calculation_error"


class StepPattern:
    """단계 패턴 판별 유틸리티 클래스"""

    @staticmethod
    def is_factorization(latex: str) -> bool:
        """인수분해 형태인지 확인"""
        return bool(re.search(r"\(.*\)(?:\*?)\(.*\)\s*=\s*0", latex))

    @staticmethod
    def is_or_expression(latex: str) -> bool:
        """논리합 형태인지 확인"""
        return "\\lor" in latex

    @staticmethod
    def is_solution_form(latex: str) -> bool:
        """해 형태인지 확인 (x = 값)"""
        return bool(re.search(r"x\s*=\s*[-\d\w+*/()]+", latex))

    @staticmethod
    def is_quadratic_equation(latex: str) -> bool:
        """이차방정식 형태인지 확인"""
        if "=" not in latex:
            return False

        lhs, rhs = latex.split("=")
        if rhs.strip() != "0":
            return False

        try:
            expr = LatexParser.parse_expression(lhs)
            x = Symbol('x')
            poly = expand(expr)
            degree = poly.as_poly(x).degree()
            return degree == 2
        except:
            return False


class EquationStepValidator:
    """수식 단계 검증기 메인 클래스"""

    def __init__(self):
        self.validators = {
            'general': GeneralStepValidator(),
            'factorization': FactorizationValidator(),
            'zero_product_rule': ZeroProductRuleValidator(),
            'solution_calculation': SolutionCalculationValidator()
        }

    def validate_step(self, prev_latex: str, curr_latex: str) -> ValidationResult:
        """단계별 수식 변환 검증"""
        try:
            # 패턴 기반으로 적절한 검증기 선택
            logger.debug(f"검증 시작 - 이전: {prev_latex}")
            logger.debug(f"검증 시작 - 현재: {curr_latex}")
            
            if StepPattern.is_factorization(curr_latex):
                logger.debug("인수분해 형태 감지")
                return self.validators['factorization'].validate(prev_latex, curr_latex)

            elif StepPattern.is_factorization(prev_latex) and StepPattern.is_or_expression(curr_latex):
                logger.debug("영 곱셈 규칙 형태 감지")
                return self.validators['zero_product_rule'].validate(prev_latex, curr_latex)

            elif StepPattern.is_or_expression(prev_latex) and StepPattern.is_or_expression(curr_latex) and StepPattern.is_solution_form(curr_latex):
                logger.debug("해 계산 형태 감지")
                return self.validators['solution_calculation'].validate(prev_latex, curr_latex)

            # 일반적인 검증
            logger.debug("일반 형태로 검증")
            return self.validators['general'].validate(prev_latex, curr_latex)

        except Exception as e:
            logger.error(f"validate_step 오류: {str(e)}")
            return False, "general_error"


def check_quadratic_solution(solution_data: Dict) -> Dict:
    """이차방정식 풀이 검증 함수"""
    validator = EquationStepValidator()
    steps = solution_data.get("steps", [])

    if not steps:
        return solution_data

    for i in range(1, len(steps)):
        prev_step = steps[i - 1]
        curr_step = steps[i]

        # 이전 단계와 현재 단계 검증
        is_valid, error_type = validator.validate_step(
            prev_step["latex"],
            curr_step["latex"]
        )

        # 검증 결과 업데이트
        curr_step["is_valid"] = is_valid

        if not is_valid and error_type:
            if "metadata" not in curr_step:
                curr_step["metadata"] = {}

            curr_step["metadata"]["prev_clean"] = prev_step["latex"]
            curr_step["metadata"]["curr_clean"] = curr_step["latex"]
            curr_step["metadata"]["error_type"] = error_type

    return solution_data


def analyze_step_change(prev_latex: str, curr_latex: str) -> Dict[str, Any]:
    """
    두 LaTeX 수식 간의 변화를 분석하여 유효성 검증
    
    Args:
        prev_latex: 이전 단계 LaTeX 수식
        curr_latex: 현재 단계 LaTeX 수식
        
    Returns:
        Dict: 분석 결과 (is_valid, details 등)
    """
    validator = EquationStepValidator()
    
    # 클린 버전 준비
    prev_clean = prev_latex
    curr_clean = curr_latex
    
    # 검증 수행
    is_valid, error_type = validator.validate_step(prev_latex, curr_latex)
    
    # 분석 결과 반환
    result = {
        "is_valid": is_valid,
        "prev_clean": prev_clean,
        "curr_clean": curr_clean,
        "details": {}
    }
    
    if not is_valid and error_type:
        result["details"]["error_type"] = error_type
    
    return result
