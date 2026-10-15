<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cloudinary Credentials
    |--------------------------------------------------------------------------
    */

    'cloud_name' => env(
        'CLOUDINARY_CLOUD_NAME'
    ),

    'api_key' => env(
        'CLOUDINARY_API_KEY'
    ),

    'api_secret' => env(
        'CLOUDINARY_API_SECRET'
    ),

    /*
    |--------------------------------------------------------------------------
    | Default Card Folder
    |--------------------------------------------------------------------------
    */

    'folder' => env(
        'CLOUDINARY_FOLDER',
        'datong/cards'
    ),

];