exports.teradataConfig = {
    libpath: 'terajdbc4.jar',
    libs: ['tdgssconfig.jar'],
    drivername: 'com.teradata.jdbc.TeraDriver',
    url: 'jdbc:teradata://terdata/TMODE=TERA',
    minpoolsize: 5,
    maxpoolsize: 10,
    // optionally
    properties: {
        user: '',
        password: ''
    }
};
