BEGIN;

INSERT INTO translations (id, label, language, value)
VALUES
   ('tr-ui-chooseTeam-en', 'helper.ui.chooseTeam', 'en', 'Choose a team'),
   ('tr-ui-chooseTeam-pl', 'helper.ui.chooseTeam', 'pl', 'Wybierz drużynę'),
   ('tr-ui-choosePlayers-en', 'helper.ui.choosePlayers', 'en', 'Choose players'),
   ('tr-ui-choosePlayers-pl', 'helper.ui.choosePlayers', 'pl', 'Wybierz graczy'),
   ('tr-ui-chooseOption-en', 'helper.ui.chooseOption', 'en', 'Choose one option'),
   ('tr-ui-chooseOption-pl', 'helper.ui.chooseOption', 'pl', 'Wybierz jedną opcję'),
   ('tr-ui-chooseOptions-en', 'helper.ui.chooseOptions', 'en', 'Choose options'),
   ('tr-ui-chooseOptions-pl', 'helper.ui.chooseOptions', 'pl', 'Wybierz opcje'),
   ('tr-ui-ok-en', 'helper.ui.ok', 'en', 'OK'),
   ('tr-ui-ok-pl', 'helper.ui.ok', 'pl', 'OK'),
   ('tr-ui-skip-en', 'helper.ui.skip', 'en', 'Skip'),
   ('tr-ui-skip-pl', 'helper.ui.skip', 'pl', 'Pomiń'),
   ('tr-ui-back-en', 'helper.ui.back', 'en', 'Back'),
   ('tr-ui-back-pl', 'helper.ui.back', 'pl', 'Wstecz'),
   ('tr-ui-restart-en', 'helper.ui.restart', 'en', 'Restart'),
   ('tr-ui-restart-pl', 'helper.ui.restart', 'pl', 'Od nowa'),
   ('tr-ui-reroll-en', 'helper.ui.reroll', 'en', 'Reroll'),
   ('tr-ui-reroll-pl', 'helper.ui.reroll', 'pl', 'Losuj ponownie'),
   ('tr-ui-tooFew-en', 'helper.ui.tooFew', 'en', 'Choose at least {{min}}'),
   ('tr-ui-tooFew-pl', 'helper.ui.tooFew', 'pl', 'Wybierz co najmniej {{min}}'),
   ('tr-ui-tooMany-en', 'helper.ui.tooMany', 'en', 'Choose at most {{max}}'),
   ('tr-ui-tooMany-pl', 'helper.ui.tooMany', 'pl', 'Wybierz co najwyżej {{max}}'),
   ('tr-ui-randomizing-en', 'helper.ui.randomizing', 'en', 'Randomizing…'),
   ('tr-ui-randomizing-pl', 'helper.ui.randomizing', 'pl', 'Losowanie…'),
   ('tr-general-firstPlayer-en', 'helper.general.firstPlayer', 'en', 'First player'),
   ('tr-general-firstPlayer-pl', 'helper.general.firstPlayer', 'pl', 'Pierwszy gracz'),
   ('tr-istanbul-variant-en', 'helper.game.istanbul.variantPrompt', 'en', 'Choose the game variant'),
   ('tr-istanbul-variant-pl', 'helper.game.istanbul.variantPrompt', 'pl', 'Wybierz wariant gry'),
   ('tr-istanbul-vanilla-en', 'helper.game.istanbul.enum.istanbulMode.vanilla', 'en', 'Base game'),
   ('tr-istanbul-vanilla-pl', 'helper.game.istanbul.enum.istanbulMode.vanilla', 'pl', 'Gra podstawowa'),
   ('tr-istanbul-coffee-en', 'helper.game.istanbul.enum.istanbulMode.coffee', 'en', 'Mocha & Baksheesh'),
   ('tr-istanbul-coffee-pl', 'helper.game.istanbul.enum.istanbulMode.coffee', 'pl', 'Kawa i Bakszysz'),
   ('tr-istanbul-letters-en', 'helper.game.istanbul.enum.istanbulMode.letters', 'en', 'Letters & Seals'),
   ('tr-istanbul-letters-pl', 'helper.game.istanbul.enum.istanbulMode.letters', 'pl', 'Listy i Pieczęcie'),
   ('tr-istanbul-grandBazaar-en', 'helper.game.istanbul.enum.istanbulMode.grandBazaar', 'en', 'Great Bazaar'),
   ('tr-istanbul-grandBazaar-pl', 'helper.game.istanbul.enum.istanbulMode.grandBazaar', 'pl', 'Wielki Bazar'),
   ('tr-istanbul-governor-en', 'helper.game.istanbul.governor', 'en', 'Governor'),
   ('tr-istanbul-governor-pl', 'helper.game.istanbul.governor', 'pl', 'Gubernator'),
   ('tr-istanbul-smuggler-en', 'helper.game.istanbul.smuggler', 'en', 'Smuggler'),
   ('tr-istanbul-smuggler-pl', 'helper.game.istanbul.smuggler', 'pl', 'Przemytnik'),
   ('tr-istanbul-coffeeman-en', 'helper.game.istanbul.coffeeman', 'en', 'Coffee trader'),
   ('tr-istanbul-coffeeman-pl', 'helper.game.istanbul.coffeeman', 'pl', 'Handlarz kawy'),
   ('tr-istanbul-courier-en', 'helper.game.istanbul.courier', 'en', 'Courier'),
   ('tr-istanbul-courier-pl', 'helper.game.istanbul.courier', 'pl', 'Kurier'),
   ('tr-sample-expansions-en', 'helper.game.sample.expansionsPrompt', 'en', 'Which expansions are you playing with?'),
   ('tr-sample-expansions-pl', 'helper.game.sample.expansionsPrompt', 'pl', 'Z jakimi dodatkami gracie?'),
   ('tr-sample-northWind-en', 'helper.game.sample.enum.sampleExpansion.northWind', 'en', 'North Wind'),
   ('tr-sample-northWind-pl', 'helper.game.sample.enum.sampleExpansion.northWind', 'pl', 'Północny Wiatr'),
   ('tr-sample-deepSea-en', 'helper.game.sample.enum.sampleExpansion.deepSea', 'en', 'Deep Sea'),
   ('tr-sample-deepSea-pl', 'helper.game.sample.enum.sampleExpansion.deepSea', 'pl', 'Głębiny'),
   ('tr-sample-card-en', 'helper.game.sample.card', 'en', 'Card {{n}}'),
   ('tr-sample-card-pl', 'helper.game.sample.card', 'pl', 'Karta {{n}}'),
   ('tr-sample-event-en', 'helper.game.sample.event', 'en', 'Event {{n}}'),
   ('tr-sample-event-pl', 'helper.game.sample.event', 'pl', 'Wydarzenie {{n}}'),
   ('tr-sample-market-en', 'helper.game.sample.market', 'en', 'Starting market'),
   ('tr-sample-market-pl', 'helper.game.sample.market', 'pl', 'Początkowy rynek'),
   ('tr-sample-weather-en', 'helper.game.sample.weather', 'en', 'Weather event'),
   ('tr-sample-weather-pl', 'helper.game.sample.weather', 'pl', 'Wydarzenie pogodowe')
ON CONFLICT (id)
DO UPDATE
SET
   label = EXCLUDED.label,
   language = EXCLUDED.language,
   value = EXCLUDED.value;

INSERT INTO sets (id, owner_id, private, name, data)
VALUES
   ('set-sample-cards', 'SYSTEM', false, 'Sample market cards', '{"items": [
      {"value": 1, "label": ["helper.game.sample.card", {"n": 1}]},
      {"value": 2, "label": ["helper.game.sample.card", {"n": 2}]},
      {"value": 3, "label": ["helper.game.sample.card", {"n": 3}]},
      {"value": 4, "label": ["helper.game.sample.card", {"n": 4}]},
      {"value": 5, "label": ["helper.game.sample.card", {"n": 5}]},
      {"value": 6, "label": ["helper.game.sample.card", {"n": 6}]},
      {"value": 7, "label": ["helper.game.sample.card", {"n": 7}]},
      {"value": 8, "label": ["helper.game.sample.card", {"n": 8}]}
   ]}'),
   ('set-sample-events', 'SYSTEM', false, 'Sample weather events', '{"items": [
      {"value": 1, "label": ["helper.game.sample.event", {"n": 1}]},
      {"value": 2, "label": ["helper.game.sample.event", {"n": 2}]},
      {"value": 3, "label": ["helper.game.sample.event", {"n": 3}]}
   ]}')
ON CONFLICT (id)
DO UPDATE
SET
   owner_id = EXCLUDED.owner_id,
   private = EXCLUDED.private,
   name = EXCLUDED.name,
   data = EXCLUDED.data,
   updated_on = CURRENT_TIMESTAMP;

INSERT INTO helpers (id, owner_id, private, name, logic)
VALUES
   ('helper-istanbul', 'SYSTEM', false, 'Istanbul setup', '{
      "schema": "helper",
      "version": "2026.0",
      "i18nPrefix": "helper.game.istanbul",
      "variables": {
         "mode": "istanbulMode",
         "governorPosition": "integer",
         "smugglerPosition": "integer",
         "coffeemanPosition": "integer",
         "courierPosition": "integer",
         "firstPlayer": "integer"
      },
      "enums": {
         "istanbulMode": ["vanilla", "coffee", "letters", "grandBazaar"]
      },
      "sets": {},
      "steps": [
         {"label": "choosePlayers", "schema": "team-and-players", "version": "2026.0", "allowSkip": true, "minPlayers": 2, "maxPlayers": 5},
         {"label": "gameVariant", "schema": "single-select", "version": "2026.0", "prompt": ["helper.game.istanbul.variantPrompt"], "targetVariable": "mode", "enum": "istanbulMode"},
         {"label": "setBigPawns", "schema": "roll", "version": "2026.0", "targetVariables": ["governorPosition", "smugglerPosition"], "formula": "2d6"},
         {"label": "setCoffeeman", "schema": "roll", "version": "2026.0", "when": {"variable": "mode", "includes": "coffee"}, "targetVariables": ["coffeemanPosition"], "formula": "2d6"},
         {"label": "setCoffeemanBazaar", "schema": "roll", "version": "2026.0", "when": {"variable": "mode", "includes": "grandBazaar"}, "targetVariables": ["coffeemanPosition"], "formula": "2d6"},
         {"label": "setCourier", "schema": "roll", "version": "2026.0", "when": {"variable": "mode", "includes": "letters"}, "targetVariables": ["courierPosition"], "formula": "2d6"},
         {"label": "setCourierBazaar", "schema": "roll", "version": "2026.0", "when": {"variable": "mode", "includes": "grandBazaar"}, "targetVariables": ["courierPosition"], "formula": "2d6"},
         {"label": "chooseFirstPlayer", "schema": "deal", "version": "2026.0", "source": "PLAYERS", "choose": 1, "targetVariable": "firstPlayer"},
         {"label": "summary", "schema": "display", "version": "2026.0", "elements": [
            {"type": "key-value", "variable": "firstPlayer", "label": ["helper.general.firstPlayer"]},
            {"type": "key-value", "variable": "governorPosition", "label": ["helper.game.istanbul.governor"]},
            {"type": "key-value", "variable": "smugglerPosition", "label": ["helper.game.istanbul.smuggler"]},
            {"type": "key-value", "variable": "coffeemanPosition", "label": ["helper.game.istanbul.coffeeman"]},
            {"type": "key-value", "variable": "courierPosition", "label": ["helper.game.istanbul.courier"]}
         ]}
      ]
   }'),
   ('helper-sample-draft', 'SYSTEM', false, 'Sample market draft', '{
      "schema": "helper",
      "version": "2026.0",
      "i18nPrefix": "helper.game.sample",
      "variables": {
         "expansions": "sampleExpansion[]",
         "market": "integer[]",
         "weather": "integer",
         "firstPlayer": "integer"
      },
      "enums": {
         "sampleExpansion": ["northWind", "deepSea"]
      },
      "sets": {
         "marketCards": "set-sample-cards",
         "weatherEvents": "set-sample-events"
      },
      "steps": [
         {"label": "choosePlayers", "schema": "team-and-players", "version": "2026.0", "minPlayers": 2, "maxPlayers": 6},
         {"label": "chooseExpansions", "schema": "multi-select", "version": "2026.0", "prompt": ["helper.game.sample.expansionsPrompt"], "targetVariable": "expansions", "enum": "sampleExpansion", "min": 0},
         {"label": "dealMarket", "schema": "deal", "version": "2026.0", "source": "marketCards", "choose": 4, "targetVariable": "market"},
         {"label": "dealWeather", "schema": "deal", "version": "2026.0", "when": {"variable": "expansions", "includes": "northWind"}, "source": "weatherEvents", "choose": 1, "targetVariable": "weather"},
         {"label": "chooseFirstPlayer", "schema": "deal", "version": "2026.0", "source": "PLAYERS", "choose": 1, "targetVariable": "firstPlayer"},
         {"label": "summary", "schema": "display", "version": "2026.0", "elements": [
            {"type": "key-value", "variable": "firstPlayer", "label": ["helper.general.firstPlayer"]},
            {"type": "list", "variable": "market", "label": ["helper.game.sample.market"]},
            {"type": "key-value", "variable": "weather", "label": ["helper.game.sample.weather"]}
         ]}
      ]
   }')
ON CONFLICT (id)
DO UPDATE
SET
   owner_id = EXCLUDED.owner_id,
   private = EXCLUDED.private,
   name = EXCLUDED.name,
   logic = EXCLUDED.logic,
   updated_on = CURRENT_TIMESTAMP;

INSERT INTO helper_sets (helper_id, set_id)
VALUES
   ('helper-sample-draft', 'set-sample-cards'),
   ('helper-sample-draft', 'set-sample-events')
ON CONFLICT (helper_id, set_id)
DO NOTHING;

COMMIT;
