# Instala lib de virtualização de socket
sudo apt install socat

# Cria socket virtual
sudo socat pty,link=/dev/ttyS0,raw,echo=0 pty,link=/dev/ttyS1,raw,echo=0

# Altera owner para acesso sem sudo
sudo chown -h $USER:dialout /dev/ttyS0
sudo chown $USER:dialout /dev/ttyS0
sudo chown -h $USER:dialout /dev/ttyS1
sudo chown $USER:dialout /dev/ttyS1

# Leitura
cat /dev/ttyS0

# Escrita
echo 99999 > /dev/ttyS1
