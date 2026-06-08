template screen types that accept individual config for details
FORM
    display a set of inputs (text, dropdown=search)
    accept list of fields with their own configs
    fields
        TEXT
            mandatory?
        DROPDOWN
            <SEARCH config>
            or
            <OPTIONS config>
SEARCH
    display a textbox and a list of results
    has a button for adding new items
    accept:
        dataType: type of result (e.g. GAME, LOCATION)
        logic (
            CHOOSE_ONE: default if no params, 
            CHOOSE_MIN_MAX: if min or max are supplied,
            ACTION: if action is supplied, parse it as Redux action
        )
        initial filter
OPTIONS
    list of buttons that will cause things to progress
    accept list of field names + their payload (if no payload, label is the payload too)
    OR an options_enum parameter -> spread out enum values as options (enums need to have assignable mappers)
    OPTIONAL options_enum_whitelist and options_enum_blacklist to filter out the enum options
    when a button is clicked, the payload is returned and processed
    if has "action" rather than "payload", parse payload as Redux action
    option can also be marked to serve as a label (e.g. in VIEW_GAME, display game name in bold, not as a button)