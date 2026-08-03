import math
import statistics


class QcService:
    """محاسبات آماری کنترل کیفیت."""

    @staticmethod
    def values_of(sample, test_type=None):
        qs = sample.test_executions.filter(status='completed', result__isnull=False)
        if test_type is not None:
            qs = qs.filter(test_type=test_type)
        return [float(t.result) for t in qs]

    @staticmethod
    def analyze(values):
        """میانگین، انحراف معیار، ضریب تغییرات و داده‌های پرت (IQR)."""
        if not values:
            return {'count': 0, 'values': [], 'outliers': [], 'mean': None, 'stdev': None}
        mean = statistics.mean(values)
        stdev = statistics.stdev(values) if len(values) > 1 else 0.0
        cv = (stdev / mean * 100) if mean else None
        q1 = statistics.quantiles(values, n=4)[0]
        q3 = statistics.quantiles(values, n=4)[2]
        iqr = q3 - q1
        lo, hi = q1 - 1.5 * iqr, q3 + 1.5 * iqr
        outliers = [v for v in values if v < lo or v > hi]
        return {
            'count': len(values),
            'mean': round(mean, 2),
            'stdev': round(stdev, 2),
            'cv_percent': round(cv, 2) if cv is not None else None,
            'min': min(values),
            'max': max(values),
            'outliers': outliers,
        }

    @staticmethod
    def check_criteria(values, criteria):
        """مقایسه نتایج با پارامترهای معیار پذیرش (مثلا min_strength)."""
        result = {'passed': True, 'checks': []}
        if not values:
            result['passed'] = False
            result['checks'].append({'rule': 'empty', 'passed': False})
            return result
        mean = statistics.mean(values)
        params = (criteria.params or {}) if criteria else {}
        if 'min_strength' in params:
            ok = mean >= params['min_strength']
            result['checks'].append({'rule': 'min_strength', 'limit': params['min_strength'], 'value': mean, 'passed': ok})
            result['passed'] = result['passed'] and ok
        if 'max_stdev' in params:
            sd = statistics.stdev(values) if len(values) > 1 else 0.0
            ok = sd <= params['max_stdev']
            result['checks'].append({'rule': 'max_stdev', 'limit': params['max_stdev'], 'value': sd, 'passed': ok})
            result['passed'] = result['passed'] and ok
        if not result['checks']:
            result['checks'].append({'rule': 'no_criteria', 'passed': True})
        return result
