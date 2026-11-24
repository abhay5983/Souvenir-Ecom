STATE_ALIASES = {
    'ap': 'Andhra Pradesh', 'ar': 'Arunachal Pradesh', 'as': 'Assam', 'br': 'Bihar',
    'cg': 'Chhattisgarh', 'ct': 'Chhattisgarh', 'ch': 'Chandigarh', 'dl': 'Delhi',
    'new delhi': 'Delhi', 'ga': 'Goa', 'gj': 'Gujarat', 'hr': 'Haryana',
    'hp': 'Himachal Pradesh', 'jk': 'Jammu and Kashmir', 'j&k': 'Jammu and Kashmir',
    'jh': 'Jharkhand', 'ka': 'Karnataka', 'kl': 'Kerala', 'la': 'Ladakh',
    'ld': 'Lakshadweep', 'mp': 'Madhya Pradesh', 'mh': 'Maharashtra', 'mn': 'Manipur',
    'ml': 'Meghalaya', 'mz': 'Mizoram', 'nl': 'Nagaland', 'od': 'Odisha', 'orissa': 'Odisha',
    'py': 'Puducherry', 'pondicherry': 'Puducherry', 'pb': 'Punjab', 'rj': 'Rajasthan',
    'sk': 'Sikkim', 'tn': 'Tamil Nadu', 'ts': 'Telangana', 'tg': 'Telangana',
    'tr': 'Tripura', 'up': 'Uttar Pradesh', 'uk': 'Uttarakhand', 'ua': 'Uttarakhand',
    'wb': 'West Bengal',
}


def normalize_state(value):
    state = ' '.join(str(value or '').strip().split())
    return STATE_ALIASES.get(state.casefold(), state)
