@echo off 
cd /d C:\inetpub\wwwroot\technician-portal 
set PATH=C:\php;%C:\Windows\system32\inetsrv;C:\Windows\system32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0\;C:\Windows\System32\OpenSSH\;C:\Program Files\dotnet\;C:\Program Files (x86)\dotnet\;C:\Program Files\Git\cmd;C:\Program Files\Microsoft\Web Platform Installer\;C:\Users\Zuhayr.Toolun\AppData\Local\Microsoft\WindowsApps;C:\ProgramData\ComposerSetup\bin;C:\Program Files (x86)\CheckPoint\Endpoint Security\Endpoint Common\bin;C:\Program Files\nodejs\;C:\Users\appservice\.config\herd-lite\bin;C:\Users\appservice\AppData\Local\Microsoft\WindowsApps;C:\Users\appservice\AppData\Roaming\npm;C:\Program Files\PHP\;C:\Users\appservice\.config\herd-lite;% 
php artisan schedule:work 
