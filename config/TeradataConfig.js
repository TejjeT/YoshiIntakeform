exports.teradataConfig = {
    libpath: 'terajdbc4.jar',
    libs: ['tdgssconfig.jar'],
    drivername: 'com.teradata.jdbc.TeraDriver',
    url: 'jdbc:teradata://oneview.kdc.capitalone.com/TMODE=TERA',
    minpoolsize: 5,
    maxpoolsize: 10,
    // optionally
    properties: {
        user: 'vlq927',
        password: ''
    }
};
