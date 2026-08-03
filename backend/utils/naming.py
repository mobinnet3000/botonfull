def generate_sample_names(floor_count: int) -> list[str]:
    names = ['فنداسیون']
    for i in range(1, floor_count + 1):
        names.append(f'ستون{i}')
        names.append(f'سقف{i}')
    return names


def generate_series_name(category: str, index: int) -> str:
    return f'{category}-{index + 1}'


def generate_mold_identifier(category: str, age: int, series_name: str) -> str:
    return f'{category}-{age}روزه-{series_name}'
