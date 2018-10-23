importPackage(Packages.com.ti.ccstudio.scripting.environment)

function initTarget() {
	var debugServer = ScriptingEnvironment.instance().getServer("DebugServer.1");

	print("Initializing target : " + appConfigFile+"\n");
	debugServer.setConfig(appConfigFile /* internal variable */);
	var session = debugServer.openSession("*", "*" /* TODO: */);

	if (!session.target.isConnected()) {
		print("Connecting target: "+session.getName()+"\n");
		session.target.connect();
	}
	
	print("Loading symbols: "+appProgramFile+"\n");
	session.symbol.load(appProgramFile /* internal variable */);
}

initTarget();