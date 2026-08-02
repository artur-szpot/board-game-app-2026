An importnat oversight the data model: the application will be multi-tenant, where each user will have their own collections. As such, all game-related tables (anything but the auth stuff) needs to have two additional columns:

- owner VARCHAR NOT NULL - FK users.id
- private BOOLEAN NOT NULL DEFAULT true

The owner property will be immutable, which saves a lot of headaches. private must be mutable already.

Subsequently, this has two effects:

- user should only be able to view their own items by default
- for now, the private flag will be ignored - sharing collections between users will come much later down the road
- however, a superuser should be able to view and interact with all users' collections

This means we require a new permission: COLLECTION_SUPERUSER. "read" will allow viewing all users' collections, "full" will allow mutating them too (at some point, perhaps, for now let's add a comment that it should only be a read-level permission).

Hence, in regards to DB operations:

- when creating items, set current user as owner and private = true
- when querying items, only allow access to those the user is owner of - unless the current user has COLLECTION_SUPERUSER
- when requests contain data IDs (e.g. location IDs, tag parentId), the user needs to have access to it (i.e. be the owner of all the relevant items); otherwise throw as though they did not exist
- this of course needs to affect count operations as well
