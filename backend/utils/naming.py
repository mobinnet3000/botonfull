def normalize_name(name: str) -> str:
    return name.replace(' ', '-').lower()

def generate_sample_names(floor_count: int) -> list[str]:
    return [f'Floor-{i+1}' for i in range(floor_count)]

def generate_series_name(category: str, index: int) -> str:
    return f'{category}-{index+1}'

def generate_mold_identifier(member_name: str, age: int, pour_name: str) -> str:
    member = normalize_name(member_name)[:20]
    pour = normalize_name(pour_name)[:20]
    return f'{member}-{pour}-{age}R'
