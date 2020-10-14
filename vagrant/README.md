# Run the application inside Ubuntu VM

1. [Install Vagrant](https://www.vagrantup.com/docs/installation)
2. Install Vagrant docker compose provisioner:
```
vagrant plugin install vagrant-docker-compose
```
3. Create VM and run the application:
```
vagrant up
```
4. Go to http://localhost:8080