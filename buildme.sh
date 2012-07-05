#!/bin/sh
# buildme.sh - Builds "shorten9tc.xpi"
# License: See the LICENSE file
# Revision: 120704

#---------------------------------------------------------------------
# Parameters.

# TOPDIR   specifies the absolute pathname of the  unpacked  top-level
# source directory.

# XPIPATH  specifies the absolute pathname of the  XPI file to be cre-
# ated.

# XTEMPDIR specifies the absolute pathname of a temporary "build" dir-
# ectory to be used. Warning: The directory will be deleted!

TOPDIR=`pwd`
XPIPATH=/tmp/shorten9tc.xpi
XTEMPDIR=/tmp/buildtmp

#---------------------------------------------------------------------
# Check for jar or fastjar.

EXEJAR=`which jar 2> /dev/null`
EXEFASTJAR=`which fastjar 2> /dev/null`

if [ "x$EXEJAR" == "x" ]; then
    EXEJAR=$EXEFASTJAR
fi
if [ "x$EXEJAR" == "x" ]; then
    echo Error: jar or fastjar is needed
    exit 1
fi
if [ \! -x $EXEJAR ]; then
    echo Error: jar or fastjar is needed
    exit 1
fi
echo Using $EXEJAR

#---------------------------------------------------------------------
# Check for zip.

EXEZIP=`which zip 2> /dev/null`

if [ "x$EXEZIP" == "x" ]; then
    echo Error: zip is needed
    exit 1
fi
if [ \! -x $EXEZIP ]; then
    echo Error: zip is needed
    exit 1
fi
echo Using $EXEZIP

#---------------------------------------------------------------------
# Misc. setup.

if [ \! -f "$TOPDIR/buildme.sh" ]; then
    echo Error: This script must be run in its directory
fi
                                # Delete existing output file
rm -fr $XPIPATH                             || exit 1
                                # Verify that file can be created
touch  $XPIPATH                             || exit 1
                                # Delete it again
rm -fr $XPIPATH                             || exit 1

                                # Delete temporary "build" directory
rm -fr   $XTEMPDIR                          || exit 1
                                # Then create it
mkdir -p $XTEMPDIR                          || exit 1

                                # Copy files needed
cp -p README   $XTEMPDIR/                   || exit 1
cp -a source/* $XTEMPDIR/                   || exit 1
                                # Go to temporary "chrome" directory
cd $XTEMPDIR/chrome                         || exit 1
                                # Move subdirectories into JAR file
$EXEJAR Mcf shorten9tc.jar content skin     || exit 1
rm -fr                     content skin     || exit 1

                                # Create XPI file
cd $XTEMPDIR                                || exit 1
$EXEZIP -ro9 $XPIPATH *                     || exit 1

                                # Delete temporary "build" directory
rm -fr   $XTEMPDIR                          || exit 1

echo
echo Created $XPIPATH
echo Done
