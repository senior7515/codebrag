package com.softwaremill.codebrag.test

import org.scalatest.{BeforeAndAfterEach, BeforeAndAfterAll, FlatSpec}
import scala.slick.jdbc.JdbcBackend.Database
import com.softwaremill.codebrag.dao.sql.SQLDatabase
import scala.slick.jdbc.StaticQuery

trait FlatSpecWithSQL extends FlatSpec with BeforeAndAfterAll with BeforeAndAfterEach {
  private val connectionString = "jdbc:h2:mem:cb_test" + this.getClass.getSimpleName + ";DB_CLOSE_DELAY=-1"
  private val db = Database.forURL(connectionString, driver="org.h2.Driver")
  val sqlDatabase = SQLDatabase(db, scala.slick.driver.H2Driver)

  override protected def beforeAll() {
    super.beforeAll()
    createAll()
  }

  def clearData() {
    dropAll()
    createAll()
  }

  override protected def afterAll() {
    super.afterAll()
    dropAll()
  }

  private def dropAll() {
    db.withSession { implicit session =>
      StaticQuery.updateNA("DROP ALL OBJECTS").execute()
    }
  }

  private def createAll() {
    SQLDatabase.updateSchema(connectionString)
  }
}