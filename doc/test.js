const joiParams = [
  { field: 'ids', items: Jod.object().keys().required().data },
  { field: 'ids.compId', items: Jod.id().data },
  { field: 'ids.subCompId', items: Jod.id().data },
  { field: 'payload', items: Jod.object().keys().required().data },
  { field: 'payload.level', items: Jod.number().integer().min(0).max(1000)
        .required().data },
  { field: 'payload.name', items: Jod.string().max(100).required().data },
  { field: 'payload.description', items: Jod.string().max(400).required().data },
  { field: 'payload.updatedBy', items: Jod.EID().data }
  ];
