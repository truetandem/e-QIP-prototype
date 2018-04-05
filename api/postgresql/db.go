package postgresql

import (
	"net/url"
	"strings"
	"time"

	"github.com/18F/e-QIP-prototype/api"
	"github.com/go-pg/pg"
	"github.com/go-pg/pg/orm"
)

// DatabaseService to help abstract the technical implementation per driver used.
type DatabaseService struct {
	Database *pg.DB
	Log      api.LogService
	Env      api.Settings
}

// NewDatabase establishes a new database connection
func (service DatabaseService) NewDatabase() *DatabaseService {
	// TODO: Fix
	addr := ""
	// addr := cf.DatabaseURI("aws-rds")

	// Parse the address as a URI. If it fails return an empty connection
	uri, err := url.Parse(addr)
	if err != nil {
		return &DatabaseService{Database: pg.Connect(&pg.Options{})}
	}

	// Remove the leading slash on the path to retrieve the database name
	dbURI := strings.TrimPrefix(uri.Path, "/")

	// Ignore whether the password was set or not since an empty string suffices
	// for the connection options as well.
	pw, _ := uri.User.Password()
	db := pg.Connect(&pg.Options{
		User:     uri.User.Username(),
		Password: pw,
		Addr:     uri.Host,
		Database: dbURI,
	})

	// Add logging
	db.OnQueryProcessed(func(event *pg.QueryProcessedEvent) {
		query, err := event.FormattedQuery()
		if err == nil {
			service.Log.Debug("Executed database query", api.LogFields{
				"elapsed": time.Since(event.StartTime),
				"query":   query,
			})
		}
	})

	return &DatabaseService{Database: db}
}

// CheckTable ensures a the table exists for the persistor.
func (service *DatabaseService) CheckTable(entity interface{}) error {
	if service.Env.String(api.GOLANG_ENV) == "test" {
		options := &orm.CreateTableOptions{
			Temp:        true,
			IfNotExists: true,
		}
		return service.Database.CreateTable(entity, options)
	}
	return nil
}

// Raw executes a string of SQL.
func (service *DatabaseService) Raw(query interface{}, params ...interface{}) error {
	_, err := service.Database.Exec(query, params...)
	return err
}

// Find will check if the model exists and run the additional functionality.
func (service *DatabaseService) Find(query interface{}, callback func(query interface{})) {
	if count, err := service.Database.Model(query).Count(); count > 0 && err == nil {
		service.Select(query)
		callback(query)
	}
}

// Conditional selection based on the model in the data store.
func (service *DatabaseService) Where(model interface{}, condition string, params ...interface{}) error {
	return service.Database.Model(model).Where(condition, params...).Select()
}

// Conditional selection based on the model in the data store only returning specific quoted columns.
func (service *DatabaseService) ColumnsWhere(model interface{}, columns []string, condition string, params ...interface{}) error {
	return service.Database.Model(model).Column(columns...).Where(condition, params...).Select()
}

func (service *DatabaseService) Count(model interface{}, condition string, params ...interface{}) int {
	count, _ := service.Database.Model(model).Where(condition, params...).Count()
	return count
}

func (service *DatabaseService) Array(model interface{}, expr string, retval interface{}, condition string, params ...interface{}) {
	service.Database.Model(model).ColumnExpr(expr).Where(condition, params...).Select(pg.Array(retval))
}

// Insert persists the new model in the data store
func (service *DatabaseService) Insert(query ...interface{}) error {
	return service.Database.Insert(query...)
}

// Update persists the existing model in the data store
func (context *DatabaseService) Update(query interface{}) error {
	return context.Database.Update(query)
}

// Save persists the model in the data store
func (service *DatabaseService) Save(query ...interface{}) error {
	for _, q := range query {
		err := service.Insert(q)
		if err != nil {
			err = service.Update(q)
		}

		// If there were no rows found we already handle this.
		if err != nil && err != pg.ErrNoRows {
			return err
		}
	}

	return nil
}

// Delete removes the model from the data store
func (service *DatabaseService) Delete(query interface{}) error {
	return service.Database.Delete(query)
}

// Select returns the model from the data store
func (service *DatabaseService) Select(query interface{}) error {
	return service.Database.Select(query)
}
