ADD_GAME // if editId parameter passed in, query for and fill out the current data, same for other ADD_ screens
    type: FORM
    config: [
        {
            type: TEXT
            name: name
        }
        {
            type: DROPDOWN
            name: location
            config: {
                type: SEARCH
                dataType: LOCATION
                min: 1
                addNote: true // will allow to add an optional note to chosen items
            }
        }
        {
            type: DROPDOWN
            name: length
            config: {
                type: OPTIONS
                options_enum: GAME_LENGTH
            }
        }
        {
            type: DROPDOWN
            name: tags
            config: {
                type: SEARCH
                dataType: TAG
                anyNumber: true
            }
        }
        {
            type: DROPDOWN
            name: scoringSchemas
            config: {
                type: SEARCH
                dataType: SCORING_SCHEMA
                anyNumber: true
            }
        }
        {
            type: DROPDOWN
            name: helpers
            config: {
                type: SEARCH
                dataType: HELPER
                anyNumber: true
            }
        }
    ]
ADD_LOCATION
    type: FORM
    config: [
        {
            type: TEXT
            name: name
        }
        {
            type: TEXT
            name: description
            optional: true
        }
        {
            type: DROPDOWN
            name: parentLocation
            config: {
                type: SEARCH
                dataType: LOCATION or GAME // dropdown needs to be able to handle mixed types like this
                optional: true
                // no parameter == choose one exactly
            }
        }
    ]
ADD_TAG
    type: FORM
    config: [
        {
            type: TEXT
            name: label
        }
        {
            type: DROPDOWN
            name: parentTag
            config: {
                type: TAG
                optional: true
                // no parameter == choose one exactly
            }
        }
    ]
LIST_GAMES
    type: SEARCH
    dataType: GAME
    // no parameter == choose one exactly
LIST_TAGS
    type: SEARCH
    dataType: TAG
    // no parameter == choose one exactly
LIST_LOCATIONS
    type: SEARCH
    dataType: LOCATION
    // no parameter == choose one exactly
MAIN_MENU
    type: OPTIONS
    options: [
        {
            label: View games
            action: {
                action: OPEN_FRAME
                payload: {
                    frame: LIST_GAMES
                    callback: {
                        action: OPEN_FRAME
                        payload: {
                            frame: VIEW_GAME
                            id: 'id' // lookup value in return object to assign value from
                        }
                    }
                }
            }
        }
        {
            label: Manage locations
            action: {
                action: OPEN_FRAME
                payload: {
                    frame: LIST_LOCATIONS
                    callback: {
                        action: OPEN_FRAME
                        payload: {
                            frame: VIEW_LOCATION
                            id: 'id' // lookup value in return object to assign value from
                        }
                    }
                }
            }
        }
        {
            label: Manage tags
            action: {
                action: OPEN_FRAME
                payload: {
                    frame: LIST_TAGS
                    callback: {
                        action: OPEN_FRAME
                        payload: {
                            frame: VIEW_TAG
                            id: 'id' // lookup value in return object to assign value from
                        }
                    }
                }
            }
        }
        // for the future: configurable shorthand of generic helpers llike choose players
    ]
VIEW_GAME
    type: OPTIONS
    options: [
        {
            label: <game name>
            isHeader: true
        }
        {
            label: <game description>
            isLabel: true
        }
        {
            label: <game location> (per location, with note if applicable)
            isLabel: true
        }
        {
            label: <tag name> (per tag)
            isLabel: true
        }
        {
            label: <scoring schema name> (per schema)
            action: {
                action: OPEN_FRAME
                payload: {
                    frame: SCOREPAD
                    id: <scoring schema id>
                }
            }
        }
        {
            label: <helper name> (per helper)
            action: {
                action: OPEN_FRAME
                payload: {
                    frame: HELPER
                    id: <helper id>
                }
            }
        }
        {
            label: "Edit"
            action: {
                action: OPEN_FRAME
                payload: {
                    frame: ADD_GAME
                    editId: <game ID>
                }
            }
        }
        {
            label: "Delete"
            action: {
                action: DELETE_GAME
                payload: {
                    id: <game ID>
                }
            }
        }
    ]
VIEW_LOCATION
    type: OPTIONS
    options: [
        {
            label: <location name>
            isHeader: true
        }
        {
            label: <location description>
            isLabel: true
        }
        {
            label: <location parent>
            action: {
                action: OPEN_FRAME
                payload: {
                    frame: VIEW_LOCATION
                    id: <location parent ID>
                }
            }
        }
        {
            label: "View games"
            action: {
                action: OPEN_FRAME
                payload: {
                    frame: LIST_GAMES
                    filters: {
                        locationId: <location ID>
                    }
                    readOnly: true
                    callback: {
                        action: OPEN_FRAME
                        payload: {
                            frame: VIEW_GAME
                            id: 'id'
                        }
                    }
                }
            }
        }
        {
            label: "View children (<count>)"
            action: {
                action: OPEN_FRAME
                payload: {
                    frame: LIST_LOCATIONS
                    filters: {
                        parentId: <location ID>
                    }
                    readOnly: true
                    callback: {
                        action: OPEN_FRAME
                        payload: {
                            frame: VIEW_LOCATION
                            id: 'id'
                        }
                    }
                }
            }
        }
        {
            label: "Edit"
            action: {
                action: OPEN_FRAME
                payload: {
                    frame: ADD_LOCATION
                    editId: <location ID>
                }
            }
        }
        {
            label: "Delete"
            action: {
                action: DELETE_LOCATION
                payload: {
                    id: <location ID>
                }
            }
        }
    ]
VIEW_TAG
    type: OPTIONS
    options: [
        {
            label: <tag name>
            isHeader: true
        }
        {
            label: <tag parent>
            action: {
                action: OPEN_FRAME
                payload: {
                    frame: VIEW_TAG
                    id: <tag parent ID>
                }
            }
        }
        {
            label: "View games"
            action: {
                action: OPEN_FRAME
                payload: {
                    frame: LIST_GAMES
                    filters: {
                        tagId: <tag ID>
                    }
                    readOnly: true
                    callback: {
                        action: OPEN_FRAME
                        payload: {
                            frame: VIEW_GAME
                            id: 'id'
                        }
                    }
                }
            }
        }
        {
            label: "View children (<count>)"
            action: {
                action: OPEN_FRAME
                payload: {
                    frame: LIST_TAGS
                    filters: {
                        parentId: <tag ID>
                    }
                    readOnly: true
                    callback: {
                        action: OPEN_FRAME
                        payload: {
                            frame: VIEW_TAG
                            id: 'id'
                        }
                    }
                }
            }
        }
        {
            label: "Edit"
            action: {
                action: OPEN_FRAME
                payload: {
                    frame: ADD_TAG
                    editId: <tag ID>
                }
            }
        }
        {
            label: "Delete"
            action: {
                action: DELETE_TAG
                payload: {
                    id: <tag ID>
                }
            }
        }
    ]